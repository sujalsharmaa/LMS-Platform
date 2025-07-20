// src/config/kafka-config.ts
import { Kafka } from 'kafkajs';
// Load environment variables (ensure you have a .env file or similar setup)
// For production, these should be set in the deployment environment.
const KAFKA_BROKER = process.env.KAFKA_BROKER || 'localhost:9092';
const CLIENT_ID = process.env.KAFKA_CLIENT_ID || '1';
export const AUTH_LOGS_TOPIC = process.env.AUTH_LOGS_TOPIC || 'auth-logs';
export const AUTH_GROUP_ID = process.env.AUTH_GROUP_ID || 'auth-group';
// Initialize Kafka client
const kafka = new Kafka({
    clientId: CLIENT_ID,
    brokers: [KAFKA_BROKER],
    // Optional: Add retry and connection timeout configurations for production
    retry: {
        initialRetryTime: 100,
        retries: 8
    },
    connectionTimeout: 3000
});
let producerInstance = null;
let consumerInstance = null;
/**
 * Connects to Kafka and initializes the producer.
 * @returns The Kafka producer instance.
 */
export const connectKafkaProducer = async () => {
    if (producerInstance) {
        console.log('Kafka producer already connected.');
        return producerInstance;
    }
    try {
        const producer = kafka.producer();
        await producer.connect();
        producerInstance = producer;
        console.log('Kafka producer connected successfully.');
        // Handle graceful shutdown
        process.on('SIGTERM', async () => {
            console.log('SIGTERM received. Disconnecting Kafka producer...');
            await disconnectKafkaProducer();
            process.exit(0);
        });
        process.on('SIGINT', async () => {
            console.log('SIGINT received. Disconnecting Kafka producer...');
            await disconnectKafkaProducer();
            process.exit(0);
        });
        return producerInstance;
    }
    catch (error) {
        console.error('Failed to connect Kafka producer:', error);
        // Re-throw the error to indicate a critical failure
        throw new Error('Kafka producer connection failed');
    }
};
/**
 * Disconnects the Kafka producer.
 */
export const disconnectKafkaProducer = async () => {
    if (producerInstance) {
        try {
            await producerInstance.disconnect();
            producerInstance = null;
            console.log('Kafka producer disconnected successfully.');
        }
        catch (error) {
            console.error('Failed to disconnect Kafka producer:', error);
        }
    }
};
/**
 * Starts a Kafka consumer for a given topic and group.
 * This is an example and might need to be adapted based on specific consumer needs.
 * @param topic The topic to subscribe to.
 * @param groupId The consumer group ID.
 * @param eachMessageCallback Callback function to handle each message.
 * @returns The Kafka consumer instance.
 */
export const startKafkaConsumer = async (topic = AUTH_LOGS_TOPIC, groupId = AUTH_GROUP_ID, eachMessageCallback) => {
    if (consumerInstance) {
        console.log('Kafka consumer already started.');
        return consumerInstance;
    }
    try {
        const consumer = kafka.consumer({ groupId });
        await consumer.connect();
        await consumer.subscribe({ topic, fromBeginning: true });
        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                if (message.value) {
                    try {
                        // Assuming message value is a string, parse if it's JSON
                        const parsedMessage = message.value.toString();
                        console.log({
                            topic,
                            partition,
                            offset: message.offset,
                            value: parsedMessage,
                        });
                        await eachMessageCallback({ topic, partition, message: parsedMessage });
                    }
                    catch (e) {
                        console.error(`Error processing message from topic ${topic}:`, e);
                    }
                }
            },
        });
        consumerInstance = consumer;
        console.log(`Kafka consumer for topic "${topic}" and group "${groupId}" started successfully.`);
        // Handle graceful shutdown for consumer
        process.on('SIGTERM', async () => {
            console.log('SIGTERM received. Disconnecting Kafka consumer...');
            await disconnectKafkaConsumer();
            process.exit(0);
        });
        process.on('SIGINT', async () => {
            console.log('SIGINT received. Disconnecting Kafka consumer...');
            await disconnectKafkaConsumer();
            process.exit(0);
        });
        return consumerInstance;
    }
    catch (error) {
        console.error('Failed to start Kafka consumer:', error);
        throw new Error('Kafka consumer connection failed');
    }
};
/**
 * Disconnects the Kafka consumer.
 */
export const disconnectKafkaConsumer = async () => {
    if (consumerInstance) {
        try {
            await consumerInstance.disconnect();
            consumerInstance = null;
            console.log('Kafka consumer disconnected successfully.');
        }
        catch (error) {
            console.error('Failed to disconnect Kafka consumer:', error);
        }
    }
};
