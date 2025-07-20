// app.ts
import express from "express";
import cors from "cors";
import userRoutes from "../routes/user.routes.js";
import { metricsMiddleware, registerMetricsEndpoint } from "../utils/prometheus.js"; // Import metrics utilities

const app = express();

app.use(cors());
app.use(express.json());

// Use the metrics middleware before your routes so it captures all requests
app.use(metricsMiddleware);

app.use("/api/user", userRoutes);

// Register the /metrics endpoint
registerMetricsEndpoint(app);

const PORT = process.env.PORT || 3200;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));