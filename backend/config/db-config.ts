// src/config/db.ts
import dotenv from 'dotenv';
import { PoolConfig } from 'pg'; 
dotenv.config(); 


// Define an interface for database configuration to ensure type safety
interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password?: string; // Password can be optional if using other auth methods
  database: string;
  max: number; // Maximum number of clients in the pool

}

const dbConfig: DatabaseConfig = {
  host: process.env.DB_HOST || '44.223.72.49',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres', // This should be set in .env for production
  database: process.env.DB_NAME || 'postgres',
  max: parseInt(process.env.DB_POOL_MAX || '10', 10), // Default pool size
};


export default dbConfig as PoolConfig; // Cast to PoolConfig as it directly maps to pg.Pool options
