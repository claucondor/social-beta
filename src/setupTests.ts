// Global test setup
import 'dotenv/config';

// Mock environment variables for testing
process.env.GCP_PROJECT_ID = 'test-project';
process.env.FLOW_ACCESS_NODE = 'https://rest-testnet.onflow.org';
process.env.FLOW_NETWORK = 'testnet';
process.env.FLOW_ORACLE_ADDRESS = '0x1234567890abcdef';
process.env.FLOW_ORACLE_PRIVATE_KEY = 'test-private-key';
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error';
process.env.GCS_BUCKET_NAME = 'test-bucket';

// Suppress console logs during testing
global.console = {
  ...console,
  // Keep error and warn for debugging
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
};