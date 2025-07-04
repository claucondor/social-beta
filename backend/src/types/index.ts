// Message types
export interface Message {
  id?: string;
  recipientAddress: string;
  encryptedContent: string;
  deliveryTimestamp: number;
  createdAt: number;
  processed?: boolean;
  processedAt?: number;
  senderAddress?: string;
}

// Bond/NFT types
export interface Bond {
  id: string;
  tokenId: string;
  ownerAddress: string;
  recipientAddress: string;
  level: number;
  artSeed: string[];
  codexURI?: string;
  thumbnail?: string;
  lastEvolution?: number;
  conversationContext?: ConversationMessage[];
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

// User types
export interface User {
  address: string;
  displayName?: string;
  publicKey?: string;
  joinedAt: number;
  totalBonds: number;
  totalXP: number;
  lastActive: number;
  status: 'active' | 'inactive';
}

export interface UserRegistration {
  address: string;
  displayName?: string;
  publicKey?: string;
}

// Flow blockchain types
export interface FlowTransaction {
  transactionId: string;
  status: 'pending' | 'sealed' | 'executed' | 'expired' | 'unknown';
  errorMessage?: string;
}

export interface BondEvolvedEvent {
  bondId: string;
  newLevel: number;
  artSeed: string[];
  timestamp: number;
}

// AI/Vertex AI types
export interface GeneratedContent {
  text: string;
  imageData?: string; // SVG content
}

export interface AIPromptContext {
  bondLevel: number;
  artSeed: string[];
  conversationHistory: ConversationMessage[];
  evolutionTrigger: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

// Scheduler types
export interface ScheduledJob {
  id: string;
  type: 'message_processing' | 'bond_evolution';
  scheduledAt: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  metadata?: Record<string, any>;
}

// Cloud Storage types
export interface StorageUploadResult {
  url: string;
  filename: string;
  bucketName: string;
}

// Environment types
export type Environment = 'development' | 'production' | 'test';
export type LogLevel = 'error' | 'warn' | 'info' | 'debug';
export type FlowNetwork = 'testnet' | 'mainnet';