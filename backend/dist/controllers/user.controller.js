// src/controllers/user.controller.ts
import { connectKafkaProducer, AUTH_LOGS_TOPIC } from "../config/kafka-config.js";
import { dbPool } from "../config/db-connection.js";
import { kafkaProducerMessageCounter, kafkaProducerErrorCounter } from '../utils/prometheus.js';
let producerPromise = connectKafkaProducer();
export const syncOAuthUser = async (req, res) => {
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
            }
            catch (kafkaError) {
                console.error("Failed to send Kafka message:", kafkaError);
                kafkaProducerErrorCounter.inc({ topic: AUTH_LOGS_TOPIC });
            }
        }
        else {
            console.log(`Existing user found: ${email}`);
        }
        console.log("syncOAuthUser successful for:", email);
        res.status(200).json({ success: true, user });
    }
    catch (err) {
        console.error("Error in syncOAuthUser:", err);
        res.status(500).json({
            error: "Internal Server Error",
            details: err instanceof Error ? err.message : "An unknown error occurred"
        });
    }
};
export const test = (req, res) => {
    console.log("Test endpoint hit.");
    res.status(200).json({ message: "The app is working fine. Status 200." });
};
