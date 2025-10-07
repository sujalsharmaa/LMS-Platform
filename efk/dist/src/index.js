// src/services/log-consumer.ts
import 'dotenv/config'; // Load environment variables
import { Client } from '@elastic/elasticsearch';
import { startKafkaConsumer, AUTH_LOGS_TOPIC, AUTH_GROUP_ID } from '../config/kafka-config.js';
import client from 'prom-client'; // Import prom-client for Prometheus metrics
import express from 'express'; // Import express for creating the HTTP server
import dotenv from "dotenv";
dotenv.config();
// --- Prometheus Configuration ---
const PROMETHEUS_PORT = 8900;
const PROMETHEUS_METRICS_PATH = process.env.PROMETHEUS_METRICS_PATH || '/metrics';
// Create an Express application
const app = express();
// Create a Registry to register metrics
const register = new client.Registry();
// Enable default metrics (Node.js process metrics like CPU, memory, etc.)
client.collectDefaultMetrics({ register });
// Define custom metrics
const kafkaMessagesProcessed = new client.Counter({
    name: 'kafka_messages_processed_total',
    help: 'Total number of Kafka messages processed by the consumer.',
    labelNames: ['topic', 'partition'],
    registers: [register],
});
const elasticsearchIndexingErrors = new client.Counter({
    name: 'elasticsearch_indexing_errors_total',
    help: 'Total number of errors encountered while indexing messages to Elasticsearch.',
    registers: [register],
});
const elasticsearchIndexingDurationSeconds = new client.Histogram({
    name: 'elasticsearch_indexing_duration_seconds',
    help: 'Duration of Elasticsearch indexing operations in seconds.',
    buckets: client.exponentialBuckets(0.001, 2, 10), // 1ms, 2ms, 4ms, ..., 512ms
    registers: [register],
});
// --- Elasticsearch Configuration ---
const ELASTICSEARCH_NODE = process.env.ELASTICSEARCH_NODE;
const ELASTICSEARCH_INDEX = process.env.ELASTICSEARCH_INDEX || 'auth_logs';
// Initialize Elasticsearch client
const esClient = new Client({
    node: ELASTICSEARCH_NODE,
    // Optional: Add authentication if your Elasticsearch requires it
    // auth: {
    //   username: process.env.ELASTICSEARCH_USERNAME || 'elastic',
    //   password: process.env.ELASTICSEARCH_PASSWORD || 'changeme'
    // },
    maxRetries: 5,
    requestTimeout: 60000, // 60 seconds
    sniffOnStart: true // Discover nodes in the cluster
});
/**
 * Ensures the Elasticsearch index exists.
 * If the index does not exist, it will be created.
 */
async function ensureElasticsearchIndex() {
    try {
        const exists = await esClient.indices.exists({ index: ELASTICSEARCH_INDEX });
        if (!exists) {
            console.log(`Elasticsearch index '${ELASTICSEARCH_INDEX}' does not exist. Creating it...`);
            await esClient.indices.create({ index: ELASTICSEARCH_INDEX });
            console.log(`Elasticsearch index '${ELASTICSEARCH_INDEX}' created successfully.`);
        }
        else {
            console.log(`Elasticsearch index '${ELASTICSEARCH_INDEX}' already exists.`);
        }
    }
    catch (error) {
        console.error(`Error ensuring Elasticsearch index '${ELASTICSEARCH_INDEX}':`, error);
        // Depending on severity, you might want to exit the process here
        throw new Error(`Failed to ensure Elasticsearch index: ${error instanceof Error ? error.message : String(error)}`);
    }
}
/**
 * Callback function to process each message consumed from Kafka.
 * This function sends the message to Elasticsearch.
 * @param payload The message payload from Kafka (topic, partition, message value).
 */
const processKafkaMessage = async (payload) => {
    // Increment counter for processed Kafka messages
    kafkaMessagesProcessed.labels(payload.topic, payload.partition.toString()).inc();
    const end = elasticsearchIndexingDurationSeconds.startTimer(); // Start timer for indexing duration
    try {
        // Assuming the message is a JSON string as sent from user.controller.ts
        const logData = JSON.parse(payload.message);
        // Add metadata for better logging and searching
        const document = {
            ...logData,
            kafkaTopic: payload.topic,
            kafkaPartition: payload.partition,
            timestamp: new Date().toISOString(), // Add a timestamp for time-based indexing/searching
        };
        // Index the document into Elasticsearch
        const response = await esClient.index({
            index: ELASTICSEARCH_INDEX,
            document: document,
            // Optional: If you want to use a specific ID from your logData (e.g., userId)
            // id: logData.userId,
        });
        console.log(`Indexed message to Elasticsearch (ID: ${response._id}):`, document);
    }
    catch (error) {
        console.error(`Error processing Kafka message or indexing to Elasticsearch:`, error);
        console.error('Original Kafka message:', payload.message);
        elasticsearchIndexingErrors.inc(); // Increment error counter on failure
    }
    finally {
        end(); // End timer for indexing duration
    }
};
/**
 * Main function to start the log consumer service.
 */
async function startLogConsumerService() {
    try {
        // First, ensure the Elasticsearch index is ready
        await ensureElasticsearchIndex();
        // Then, start the Kafka consumer
        console.log(`Starting Kafka consumer for topic '${AUTH_LOGS_TOPIC}' with group '${AUTH_GROUP_ID}'...`);
        await startKafkaConsumer(AUTH_LOGS_TOPIC, AUTH_GROUP_ID, processKafkaMessage);
        console.log('Log consumer service started successfully.');
        // Set up the Prometheus metrics endpoint using Express
        app.get(PROMETHEUS_METRICS_PATH, async (req, res) => {
            try {
                res.set('Content-Type', register.contentType);
                res.end(await register.metrics());
            }
            catch (ex) {
                res.status(500).end(ex);
            }
        });
        // Start the Express server
        app.listen(PROMETHEUS_PORT, () => {
            console.log(`Prometheus metrics exposed on http://localhost:${PROMETHEUS_PORT}${PROMETHEUS_METRICS_PATH}`);
        });
    }
    catch (error) {
        console.error('Failed to start log consumer service:', error);
        process.exit(1); // Exit if critical services fail to start
    }
}
// Start the service when this file is executed
startLogConsumerService();
