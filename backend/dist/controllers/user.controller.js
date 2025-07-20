// src/controllers/user.controller.ts
import { PrismaClient } from "@prisma/client";
import { connectKafkaProducer, AUTH_LOGS_TOPIC } from "../config/kafka-config.js";
// Import your custom Kafka metrics
import { kafkaProducerMessageCounter, kafkaProducerErrorCounter } from '../utils/prometheus.js';
const prisma = new PrismaClient();
let producer; // Will be initialized asynchronously
(async () => {
    try {
        producer = await connectKafkaProducer();
    }
    catch (error) {
        console.error("Failed to initialize Kafka producer in user.controller:", error);
        // Depending on your application's tolerance, you might want to exit or disable Kafka features here.
        // Consider incrementing an application-level error counter here if init fails
    }
})();
/**
 * Synchronizes OAuth user data with the database.
 * Creates a new user if one does not exist, otherwise returns the existing user.
 * Publishes a message to Kafka if a new user is created.
 * @param req Express Request object
 * @param res Express Response object
 * @returns JSON response with success status and user data, or an error.
 */
export const syncOAuthUser = async (req, res) => {
    console.log("Received syncOAuthUser request");
    const { email, name, image, provider } = req.body;
    if (!email) {
        console.warn("Bad Request: Email is required for syncOAuthUser.");
        return res.status(400).json({ error: "Email is required" });
    }
    try {
        let user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            // Create new user if not found
            user = await prisma.user.create({
                data: {
                    email,
                    name,
                    image,
                    provider,
                },
            });
            console.log(`New user created: ${user.email}`);
            // Publish message to Kafka if producer is initialized
            if (producer) {
                try {
                    await producer.send({
                        topic: AUTH_LOGS_TOPIC,
                        messages: [
                            { value: JSON.stringify({ event: "newUserCreated", userId: user.id, email: user.email }), partition: 0 },
                        ],
                    });
                    console.log(`Kafka message sent for new user: ${user.email}`);
                    // Increment Kafka producer success counter
                    kafkaProducerMessageCounter.inc({ topic: AUTH_LOGS_TOPIC, event_type: 'newUserCreated' });
                }
                catch (kafkaError) {
                    console.error("Failed to send Kafka message:", kafkaError);
                    // Increment Kafka producer error counter
                    kafkaProducerErrorCounter.inc({ topic: AUTH_LOGS_TOPIC });
                }
            }
            else {
                console.warn("Kafka producer not initialized. New user creation not logged to Kafka.");
                // Consider a counter for unlogged events due to producer not being ready
            }
        }
        else {
            console.log(`Existing user found: ${user.email}`);
        }
        console.log("syncOAuthUser successful for:", user.email);
        res.status(200).json({ success: true, user });
    }
    catch (err) {
        console.error("Error in syncOAuthUser:", err);
        // More specific error handling could be added here (e.g., Prisma errors)
        res.status(500).json({ error: "Internal Server Error", details: err instanceof Error ? err.message : "An unknown error occurred" });
        // You could add a generic application error counter here as well
    }
};
/**
 * Simple test endpoint to check if the application is running.
 * @param req Express Request object
 * @param res Express Response object
 * @returns JSON response indicating application status.
 */
export const test = (req, res) => {
    console.log("Test endpoint hit.");
    res.status(200).json({ message: "The app is working fine. Status 200." });
};
