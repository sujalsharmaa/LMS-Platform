// src/controllers/user.controller.ts

import { Request, Response } from "express";

import { connectKafkaProducer, AUTH_LOGS_TOPIC } from "../config/kafka-config.js";
import { dbPool } from "../config/db-connection.js";
import { kafkaProducerMessageCounter, kafkaProducerErrorCounter } from '../utils/prometheus.js';


let producerPromise = connectKafkaProducer();

export const syncOAuthUser = async (req: Request, res: Response): Promise<any> => {
  console.log("Received syncOAuthUser request");

  const { email, name, image, provider } = req.body;

  if (!email) {
    console.warn("Bad Request: Email is required for syncOAuthUser.");
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    let userResult = await dbPool.query(`SELECT * from users where email = $1`, [email]);
    let user = userResult.rows[0];

    if (!user) {
      // Create new user if not found
      await dbPool.query(`INSERT INTO users (email, name, image, provider) VALUES ($1, $2, $3, $4)`, [
        email, name, image, provider
      ]);
      console.log(`New user created: ${email}`);

      try {
        const producer = await producerPromise; // 🧠 Await the producer before using
        await producer.send({
          topic: AUTH_LOGS_TOPIC,
          messages: [
            { value: JSON.stringify({ event: "newUserCreated", email }), partition: 0 },
          ],
        });
        console.log(`Kafka message sent for new user: ${email}`);
        kafkaProducerMessageCounter.inc({ topic: AUTH_LOGS_TOPIC, event_type: 'newUserCreated' });
      } catch (kafkaError) {
        console.error("Failed to send Kafka message:", kafkaError);
        kafkaProducerErrorCounter.inc({ topic: AUTH_LOGS_TOPIC });
      }
    } else {
      console.log(`Existing user found: ${email}`);
    }

    console.log("syncOAuthUser successful for:", email);
    res.status(200).json({ success: true, user });
  } catch (err) {
    console.error("Error in syncOAuthUser:", err);
    res.status(500).json({
      error: "Internal Server Error",
      details: err instanceof Error ? err.message : "An unknown error occurred"
    });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  const {
    full_name,
    headline,
    Bio,
    language,
    website_url,
    facebook_url,
    twitter_url,
    linkedin_url,
    youtube_url
  } = req.body;

  // Assuming req.user is populated by some authentication middleware
  const email = req.user?.email; // Use optional chaining for safety

  if (!email) {
    return res.status(401).json({ message: "Unauthorized: User email not found." });
  }

  try {
    const queryText = `
      UPDATE users
      SET
        full_name = $1,
        headline = $2,
        Bio = $3,
        language = $4,
        website_url = $5,
        facebook_url = $6,
        twitter_url = $7,
        linkedin_url = $8,
        youtube_url = $9
      WHERE email = $10
      RETURNING *; -- Optional: Returns the updated row(s)
    `;

    const queryParams = [
      full_name,
      headline,
      Bio,
      language,
      website_url,
      facebook_url,
      twitter_url,
      linkedin_url,
      youtube_url,
      email 
    ];

    const result = await dbPool.query(queryText, queryParams);

    if (result.rowCount === 0) {
      // No rows updated, likely because the email didn't match an existing user
      return res.status(404).json({ message: "User not found or no changes were made." });
    }

    console.log("Profile updated successfully:", result.rows[0]); // Log the updated row
    res.status(200).json({ message: "Profile updated successfully!", user: result.rows[0] });

  } catch (error: any) {
    console.error("Error updating profile:", error);
    // More specific error handling could be added here (e.g., duplicate key, validation)
    res.status(500).json({ message: "An error occurred while updating the profile." });
  }
};




export const test = (req: Request, res: Response) => {
  console.log("Test endpoint hit.");
  res.status(200).json({ message: "The app is working fine. Status 200." });
};

