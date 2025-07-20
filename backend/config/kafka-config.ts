// src/config/kafka-config.ts
import {
  Kafka,
  Producer,
  Consumer,
  EachMessagePayload,
} from 'kafkajs';

import client from 'prom-client';

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
  retry: {
    initialRetryTime: 100,
    retries: 8
  },
  connectionTimeout: 3000,
  // logLevel: logLevel.INFO, // Uncomment for more detailed KafkaJS logs
});

let producerInstance: Producer | null = null;
let consumerInstance: Consumer | null = null;

// --- KafkaJS Internal Metrics ---
const kafkaConnectionGauge = new client.Gauge({
  name: 'kafka_connection_status',
  help: 'Kafka client connection status (1 = connected, 0 = disconnected)',
  labelNames: ['client_type'],
});

const kafkaProducerBatchSizeHistogram = new client.Histogram({
  name: 'kafka_producer_batch_size_bytes',
  help: 'Size of Kafka producer message batches in bytes',
  buckets: client.linearBuckets(0, 1024 * 10, 10),
});

const kafkaProducerRequestLatencyHistogram = new client.Histogram({
  name: 'kafka_producer_request_latency_ms',
  help: 'Latency of Kafka producer requests in milliseconds',
  buckets: [1, 5, 10, 50, 100, 500, 1000],
});

const kafkaConsumerLagGauge = new client.Gauge({
  name: 'kafka_consumer_group_lag',
  help: 'Current consumer group lag per topic and partition',
  labelNames: ['group_id', 'topic', 'partition'],
});


/**
 * Connects to Kafka and initializes the producer.
 * @returns The Kafka producer instance.
 */
export const connectKafkaProducer = async (): Promise<Producer> => {
  if (producerInstance) {
    console.log('Kafka producer already connected.');
    return producerInstance;
  }

  try {
    const producer = kafka.producer();

producer.on(producer.events.CONNECT, () => {
  console.log('Kafka producer connected event.');
  kafkaConnectionGauge.set({ client_type: 'producer' }, 1);
});

producer.on(producer.events.DISCONNECT, () => {
  console.log('Kafka producer disconnected event.');
  kafkaConnectionGauge.set({ client_type: 'producer' }, 0);
});

producer.on(producer.events.REQUEST, ({ payload }: { payload: { duration: number } }) => {
  kafkaProducerRequestLatencyHistogram.observe(payload.duration);
});



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
  } catch (error) {
    console.error('Failed to connect Kafka producer:', error);
    kafkaConnectionGauge.set({ client_type: 'producer' }, 0); // Set to disconnected on failure
    throw new Error('Kafka producer connection failed');
  }
};

/**
 * Disconnects the Kafka producer.
 */
export const disconnectKafkaProducer = async (): Promise<void> => {
  if (producerInstance) {
    try {
      await producerInstance.disconnect();
      producerInstance = null;
      console.log('Kafka producer disconnected successfully.');
      kafkaConnectionGauge.set({ client_type: 'producer' }, 0);
    } catch (error) {
      console.error('Failed to disconnect Kafka producer:', error);
    }
  }
};

/**
 * Starts a Kafka consumer for a given topic and group.
 * @param topic The topic to subscribe to.
 * @param groupId The consumer group ID.
 * @param eachMessageCallback Callback function to handle each message.
 * @returns The Kafka consumer instance.
 */
export const startKafkaConsumer = async (
  topic: string = AUTH_LOGS_TOPIC,
  groupId: string = AUTH_GROUP_ID,
  eachMessageCallback: (payload: { topic: string; partition: number; message: string }) => Promise<void>
): Promise<Consumer> => {
  if (consumerInstance) {
    console.log('Kafka consumer already started.');
    return consumerInstance;
  }

  try {
    const consumer = kafka.consumer({ groupId });

    // Register KafkaJS consumer event listeners for metrics
    consumer.on(consumer.events.CONNECT, () => {
      console.log('Kafka consumer connected event.');
      kafkaConnectionGauge.set({ client_type: 'consumer' }, 1);
    });
    consumer.on(consumer.events.DISCONNECT, () => {
      console.log('Kafka consumer disconnected event.');
      kafkaConnectionGauge.set({ client_type: 'consumer' }, 0);
    });
    // Correctly type the payload for CRASH event and handle potential null
    consumer.on(consumer.events.CRASH, ({ payload }: { payload: { error: Error | null; restart: boolean } }) => {
      console.error('Kafka consumer crashed:', payload.error?.message || 'unknown error'); // Access .message property
      kafkaConnectionGauge.set({ client_type: 'consumer' }, 0);
      // You might want to increment a specific error counter here
    });

    await consumer.connect();
    await consumer.subscribe({ topic, fromBeginning: true });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }: EachMessagePayload) => {
        if (message.value) {
          try {
            const parsedMessage = message.value.toString();
            await eachMessageCallback({ topic, partition, message: parsedMessage });
          } catch (e) {
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
  } catch (error) {
    console.error('Failed to start Kafka consumer:', error);
    kafkaConnectionGauge.set({ client_type: 'consumer' }, 0);
    throw new Error('Kafka consumer connection failed');
  }
};

/**
 * Disconnects the Kafka consumer.
 */
export const disconnectKafkaConsumer = async (): Promise<void> => {
  if (consumerInstance) {
    try {
      await consumerInstance.disconnect();
      consumerInstance = null;
      console.log('Kafka consumer disconnected successfully.');
      kafkaConnectionGauge.set({ client_type: 'consumer' }, 0);
    } catch (error) {
      console.error('Failed to disconnect Kafka consumer:', error);
    }
  }
};