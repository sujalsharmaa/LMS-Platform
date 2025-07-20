import { Kafka } from "kafkajs";
const kafka = new Kafka({
    clientId: '1',
    brokers: ['localhost:9092'],
    retry: {
        initialRetryTime: 100,
        retries: 8
    },
    connectionTimeout: 3000
});
let producerInstance;
export const connectKafkaProducer = async () => {
    if (producerInstance) {
        console.log('Kafka producer already connected');
        return producerInstance;
    }
    try {
        const producer = kafka.producer();
        await producer.connect();
        producerInstance = producer;
        console.log('kafka producer connected successfully');
        process.on('SIGTERM', async () => {
            console.log('SIGTERM recieved Disconnecting Kafka server ...');
            await producerInstance?.disconnect();
            producerInstance = null;
        });
        return producerInstance;
    }
    catch (error) {
    }
};
