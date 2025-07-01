import 'dotenv/config';
import { z } from 'zod';

// Environment validation schema
const envSchema = z.object({
  // Google Cloud Configuration
  GCP_PROJECT_ID: z.string().min(1, 'GCP_PROJECT_ID is required'),
  
  // Flow Blockchain Configuration
  FLOW_ACCESS_NODE: z.string().url('FLOW_ACCESS_NODE must be a valid URL'),
  FLOW_NETWORK: z.enum(['testnet', 'mainnet']),
  FLOW_ORACLE_ADDRESS: z.string().min(1, 'FLOW_ORACLE_ADDRESS is required'),
  FLOW_ORACLE_PRIVATE_KEY: z.string().min(1, 'FLOW_ORACLE_PRIVATE_KEY is required'),
  
  // Application Configuration
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  PORT: z.string().transform((val: string) => parseInt(val, 10)).pipe(z.number().min(1).max(65535)).default('8080'),
  
  // Cloud Storage
  GCS_BUCKET_NAME: z.string().min(1, 'GCS_BUCKET_NAME is required'),
  
  // Firestore Collections
  MESSAGE_QUEUE_COLLECTION: z.string().default('message_queue'),
  BONDS_COLLECTION: z.string().default('bonds'),
  USERS_COLLECTION: z.string().default('users'),
});

// Validate environment variables
const env = envSchema.parse({
  GCP_PROJECT_ID: process.env.GCP_PROJECT_ID,
  FLOW_ACCESS_NODE: process.env.FLOW_ACCESS_NODE,
  FLOW_NETWORK: process.env.FLOW_NETWORK,
  FLOW_ORACLE_ADDRESS: process.env.FLOW_ORACLE_ADDRESS,
  FLOW_ORACLE_PRIVATE_KEY: process.env.FLOW_ORACLE_PRIVATE_KEY,
  NODE_ENV: process.env.NODE_ENV,
  LOG_LEVEL: process.env.LOG_LEVEL,
  PORT: process.env.PORT,
  GCS_BUCKET_NAME: process.env.GCS_BUCKET_NAME,
  MESSAGE_QUEUE_COLLECTION: process.env.MESSAGE_QUEUE_COLLECTION,
  BONDS_COLLECTION: process.env.BONDS_COLLECTION,
  USERS_COLLECTION: process.env.USERS_COLLECTION,
});

export const config = {
  gcp: {
    projectId: env.GCP_PROJECT_ID,
    bucketName: env.GCS_BUCKET_NAME,
  },
  flow: {
    accessNode: env.FLOW_ACCESS_NODE,
    network: env.FLOW_NETWORK,
    oracleAddress: env.FLOW_ORACLE_ADDRESS,
    oraclePrivateKey: env.FLOW_ORACLE_PRIVATE_KEY,
  },
  app: {
    port: env.PORT,
    nodeEnv: env.NODE_ENV,
    logLevel: env.LOG_LEVEL,
    isProduction: env.NODE_ENV === 'production',
    isDevelopment: env.NODE_ENV === 'development',
  },
  firestore: {
    messageQueueCollection: env.MESSAGE_QUEUE_COLLECTION,
    bondsCollection: env.BONDS_COLLECTION,
    usersCollection: env.USERS_COLLECTION,
  },
  vertexAI: {
    location: 'us-central1', // Default region for Vertex AI
    textModel: 'gemini-1.5-pro',
    imageModel: 'gemini-1.5-pro-vision',
  }
} as const;

export type Config = typeof config;