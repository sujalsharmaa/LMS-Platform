// src/config/db-connection.ts
import { Pool, PoolClient } from 'pg';
import dbConfig from './db-config.js';
import { AUTH_LOGS_TOPIC } from "./kafka-config.js";
import { kafkaProducerMessageCounter, kafkaProducerErrorCounter } from './prometheus.js';
import { Producer } from 'kafkajs';

export const dbPool = new Pool(dbConfig);
let kafkaProducer: Producer;

dbPool.on('error', (err: Error, client: PoolClient) => {
  console.error(`Database Pool Error: ${err.message}`, err.stack);
});

export async function connectToDatabase(producer: Producer, retries: number = 5, delayMs: number = 2000): Promise<void> {
  kafkaProducer = producer; // ✅ Save it for later use
  for (let i = 0; i < retries; i++) {
    try {
      const client = await dbPool.connect();
      client.release();
      await producer.send({
        topic: AUTH_LOGS_TOPIC,
        messages: [
          { value: JSON.stringify({ event: "databaseConnected" }), partition: 0 },
        ],
      });
      kafkaProducerMessageCounter.inc({ topic: AUTH_LOGS_TOPIC, event_type: 'databaseConnectionSuccess' });
      console.log("✅ PostgreSQL database connected successfully.");
      return;
    } catch (error: any) {
      await producer.send({
        topic: AUTH_LOGS_TOPIC,
        messages: [
          { value: JSON.stringify({ event: "databaseConnectionFailed", message: error.message }), partition: 0 },
        ],
      });
      kafkaProducerMessageCounter.inc({ topic: AUTH_LOGS_TOPIC, event_type: 'databaseConnectionFailed' });
      console.error(`❌ PostgreSQL connection attempt ${i + 1} failed: ${error.message}`);

      if (i < retries - 1) {
        const currentDelay = delayMs * Math.pow(2, i);
        console.warn(`Retrying DB connection in ${currentDelay / 1000}s...`);
        await new Promise(resolve => setTimeout(resolve, currentDelay));
      } else {
        await producer.send({
          topic: AUTH_LOGS_TOPIC,
          messages: [
            { value: JSON.stringify({ event: "fatalError", message: "All DB connection attempts failed." }), partition: 0 },
          ],
        });
        console.error('❌ FATAL: All PostgreSQL connection attempts failed.');
        process.exit(1);
      }
    }
  }
}


export async function isDatabaseReady(): Promise<boolean> {
  try {
    const client = await dbPool.connect();
    client.release(); // Release the client back to the pool
    return true;
  } catch (error: any) {
    console.error(`Database readiness check failed: ${error.message}`);
    return false;
  }
}


export async function closeDatabasePool(): Promise<void> {
  try {
    await dbPool.end(); // Closes all connections in the pool
    await kafkaProducer.send({
            topic: AUTH_LOGS_TOPIC,
            messages: [
              { value: JSON.stringify({ event: "databasePoolClosed" }), partition: 0 },
            ],
          });
          // Increment Kafka producer success counter
          kafkaProducerMessageCounter.inc({ topic: AUTH_LOGS_TOPIC, event_type: 'databaseConnectionFailed' });
    console.info('✅ PostgreSQL connection pool closed gracefully.');
  } catch (error: any) {
    await kafkaProducer.send({
            topic: AUTH_LOGS_TOPIC,
            messages: [
              { value: JSON.stringify({ event: "databasePoolCloseFailed",message: "❌ Error closing PostgreSQL connection pool" }), partition: 0 },
            ],
          });
          // Increment Kafka producer success counter
          kafkaProducerMessageCounter.inc({ topic: AUTH_LOGS_TOPIC, event_type: 'databaseConnectionFailed' });
    console.error(`❌ Error closing PostgreSQL connection pool: ${error.message}`, error.stack);
  }
}

// Handle graceful shutdown signals
process.on('SIGINT', async () => {
    await kafkaProducer.send({
            topic: AUTH_LOGS_TOPIC,
            messages: [
              { value: JSON.stringify({ event: "databasePoolCloseFailed",message: "SIGINT signal received. Closing database pool..." }), partition: 0 },
            ],
          });
          // Increment Kafka producer success counter
          kafkaProducerMessageCounter.inc({ topic: AUTH_LOGS_TOPIC, event_type: 'databaseConnectionFailed' });
  console.info('SIGINT signal received. Closing database pool...');
  await closeDatabasePool();
  process.exit(0);
});

process.on('SIGTERM', async () => {
    await kafkaProducer.send({
            topic: AUTH_LOGS_TOPIC,
            messages: [
              { value: JSON.stringify({ event: "databasePoolCloseFailed",message: "SIGTERM signal received. Closing database pool..." }), partition: 0 },
            ],
          });
          // Increment Kafka producer success counter
          kafkaProducerMessageCounter.inc({ topic: AUTH_LOGS_TOPIC, event_type: 'databaseConnectionFailed' });
  console.info('SIGTERM signal received. Closing database pool...');
  await closeDatabasePool();
  process.exit(0);
});
