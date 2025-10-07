import client from 'prom-client';
// Create a custom Prometheus Registry
export const prometheusRegistry = new client.Registry();
// Enable default metrics on custom registry
client.collectDefaultMetrics({ register: prometheusRegistry });
// Define custom metrics using the custom registry
export const httpRequestCounter = new client.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
    registers: [prometheusRegistry], // ✅ Explicit registry
});
export const httpRequestDurationMicroseconds = new client.Histogram({
    name: 'http_request_duration_ms',
    help: 'Duration of HTTP requests in milliseconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000],
    registers: [prometheusRegistry],
});
export const kafkaProducerMessageCounter = new client.Counter({
    name: 'kafka_producer_messages_total',
    help: 'Total number of messages sent by Kafka producer',
    labelNames: ['topic', 'event_type'],
    registers: [prometheusRegistry],
});
export const kafkaProducerErrorCounter = new client.Counter({
    name: 'kafka_producer_errors_total',
    help: 'Total number of errors encountered by Kafka producer',
    labelNames: ['topic'],
    registers: [prometheusRegistry],
});
/**
 * Middleware to collect HTTP request metrics.
 */
export const metricsMiddleware = (req, res, next) => {
    const end = httpRequestDurationMicroseconds.startTimer();
    res.on('finish', () => {
        if (req.originalUrl !== '/metrics') {
            httpRequestCounter.inc({
                method: req.method,
                route: req.route ? req.route.path : req.originalUrl,
                status_code: res.statusCode,
            });
            end({
                method: req.method,
                route: req.route ? req.route.path : req.originalUrl,
                status_code: res.statusCode,
            });
        }
    });
    next();
};
/**
 * Expose /metrics endpoint for Prometheus to scrape.
 */
export const registerMetricsEndpoint = (app) => {
    app.get('/metrics', async (_req, res) => {
        try {
            res.set('Content-Type', prometheusRegistry.contentType);
            res.end(await prometheusRegistry.metrics());
        }
        catch (ex) {
            res.status(500).end(ex);
        }
    });
    console.log('Prometheus /metrics endpoint exposed.');
};
