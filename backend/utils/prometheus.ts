// src/utils/prometheus.ts
import client from 'prom-client';
import { Request, Response, NextFunction } from 'express';

// Enable default metrics
client.collectDefaultMetrics();

// Define custom metrics
// 1. HTTP Request Counter
export const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

// 2. HTTP Request Duration Histogram
export const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in milliseconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000], // Buckets for response time
});

// 3. Custom Kafka Producer Message Counter
export const kafkaProducerMessageCounter = new client.Counter({
  name: 'kafka_producer_messages_total',
  help: 'Total number of messages sent by Kafka producer',
  labelNames: ['topic', 'event_type'],
});

// 4. Custom Kafka Producer Error Counter
export const kafkaProducerErrorCounter = new client.Counter({
  name: 'kafka_producer_errors_total',
  help: 'Total number of errors encountered by Kafka producer',
  labelNames: ['topic'],
});

/**
 * Middleware to collect HTTP request metrics.
 */
export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const end = httpRequestDurationMicroseconds.startTimer();

  res.on('finish', () => {
    // Only capture metrics for API routes, exclude /metrics itself
    if (req.originalUrl !== '/metrics') {
      httpRequestCounter.inc({
        method: req.method,
        route: req.route ? req.route.path : req.originalUrl, // Use req.route.path for parameterized routes
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
export const registerMetricsEndpoint = (app: any) => {
  app.get('/metrics', async (req: Request, res: Response) => {
    try {
      res.set('Content-Type', client.contentType);
      res.end(await client.register.metrics());
    } catch (ex) {
      res.status(500).end(ex);
    }
  });
  console.log('Prometheus /metrics endpoint exposed.');
};

// You can also expose the registry directly if needed for testing or advanced scenarios
export const prometheusRegistry = client.register;