import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { MessageService } from '../services/message.service';
import { SchedulerService } from '../services/scheduler.service';
import { FlowService } from '../services/flow.service';
import { IAService } from '../services/ia.service';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', prettyJSON());
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Services
const messageService = new MessageService();
const schedulerService = new SchedulerService();
const flowService = new FlowService();
const iaService = new IAService();

// Health check endpoint
app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'la-red-de-automatas-backend',
    version: '1.0.0'
  });
});

// Root endpoint
app.get('/', (c) => {
  return c.json({
    message: 'La Red de Autómatas - Backend API',
    documentation: '/api/docs',
    health: '/health',
    timestamp: new Date().toISOString()
  });
});

// Messages API
app.post('/api/messages', async (c) => {
  try {
    const body = await c.req.json();
    const { recipientAddress, encryptedContent, delayMinutes = 0 } = body;

    if (!recipientAddress || !encryptedContent) {
      return c.json({
        success: false,
        error: 'recipientAddress and encryptedContent are required'
      }, 400);
    }

    const result = await messageService.createMessage(
      recipientAddress,
      encryptedContent,
      delayMinutes
    );

    return c.json(result, result.success ? 201 : 500);
  } catch (error) {
    return c.json({
      success: false,
      error: `Failed to create message: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: Date.now()
    }, 500);
  }
});

app.get('/api/messages/:address', async (c) => {
  try {
    const address = c.req.param('address');
    const messages = await messageService.getMessagesForRecipient(address);

    return c.json({
      success: true,
      data: messages,
      timestamp: Date.now()
    });
  } catch (error) {
    return c.json({
      success: false,
      error: `Failed to fetch messages: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: Date.now()
    }, 500);
  }
});

app.get('/api/messages/stats', async (c) => {
  try {
    const stats = await messageService.getQueueStats();
    return c.json({
      success: true,
      data: stats,
      timestamp: Date.now()
    });
  } catch (error) {
    return c.json({
      success: false,
      error: `Failed to get queue stats: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: Date.now()
    }, 500);
  }
});

// Scheduler API (para Cloud Scheduler)
app.post('/api/scheduler/process-queue', async (c) => {
  try {
    const result = await schedulerService.processMessageQueue();
    return c.json(result, result.success ? 200 : 500);
  } catch (error) {
    return c.json({
      success: false,
      error: `Queue processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: Date.now()
    }, 500);
  }
});

app.post('/api/scheduler/process-bonds', async (c) => {
  try {
    const result = await schedulerService.processBondEvolutions();
    return c.json(result, result.success ? 200 : 500);
  } catch (error) {
    return c.json({
      success: false,
      error: `Bond processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: Date.now()
    }, 500);
  }
});

app.post('/api/scheduler/maintenance', async (c) => {
  try {
    const result = await schedulerService.runMaintenance();
    return c.json(result, result.success ? 200 : 207); // 207 para éxito parcial
  } catch (error) {
    return c.json({
      success: false,
      error: `Maintenance failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: Date.now()
    }, 500);
  }
});

// Flow blockchain API
app.get('/api/bonds/:bondId', async (c) => {
  try {
    const bondId = c.req.param('bondId');
    const bond = await flowService.getBond(bondId);

    if (!bond) {
      return c.json({
        success: false,
        error: 'Bond not found',
        timestamp: Date.now()
      }, 404);
    }

    return c.json({
      success: true,
      data: bond,
      timestamp: Date.now()
    });
  } catch (error) {
    return c.json({
      success: false,
      error: `Failed to fetch bond: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: Date.now()
    }, 500);
  }
});

app.post('/api/bonds/:bondId/grant-xp', async (c) => {
  try {
    const bondId = c.req.param('bondId');
    const body = await c.req.json();
    const { userAddress, amount } = body;

    if (!userAddress || !amount) {
      return c.json({
        success: false,
        error: 'userAddress and amount are required'
      }, 400);
    }

    const transaction = await flowService.grantXP(userAddress, amount);

    return c.json({
      success: true,
      data: transaction,
      timestamp: Date.now()
    });
  } catch (error) {
    return c.json({
      success: false,
      error: `Failed to grant XP: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: Date.now()
    }, 500);
  }
});

app.get('/api/transactions/:txId/status', async (c) => {
  try {
    const txId = c.req.param('txId');
    const status = await flowService.getTransactionStatus(txId);

    return c.json({
      success: true,
      data: status,
      timestamp: Date.now()
    });
  } catch (error) {
    return c.json({
      success: false,
      error: `Failed to get transaction status: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: Date.now()
    }, 500);
  }
});

// AI/IA API
app.post('/api/ai/generate-report', async (c) => {
  try {
    const body = await c.req.json();
    const { bondLevel, artSeed, conversationHistory, evolutionTrigger } = body;

    if (!bondLevel || !artSeed) {
      return c.json({
        success: false,
        error: 'bondLevel and artSeed are required'
      }, 400);
    }

    const context = {
      bondLevel,
      artSeed,
      conversationHistory: conversationHistory || [],
      evolutionTrigger: evolutionTrigger || 'manual'
    };

    const report = await iaService.generateMissionReport(context);

    return c.json({
      success: true,
      data: { report },
      timestamp: Date.now()
    });
  } catch (error) {
    return c.json({
      success: false,
      error: `Failed to generate report: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: Date.now()
    }, 500);
  }
});

app.post('/api/ai/generate-art', async (c) => {
  try {
    const body = await c.req.json();
    const { artSeed, bondLevel } = body;

    if (!artSeed || !bondLevel) {
      return c.json({
        success: false,
        error: 'artSeed and bondLevel are required'
      }, 400);
    }

    const svgContent = await iaService.generateBondArt(artSeed, bondLevel);

    return c.json({
      success: true,
      data: { svgContent },
      timestamp: Date.now()
    });
  } catch (error) {
    return c.json({
      success: false,
      error: `Failed to generate art: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: Date.now()
    }, 500);
  }
});

app.post('/api/ai/process-evolution/:bondId', async (c) => {
  try {
    const bondId = c.req.param('bondId');
    await iaService.processBondEvolution(bondId);

    return c.json({
      success: true,
      data: { message: `Bond ${bondId} evolution initiated` },
      timestamp: Date.now()
    });
  } catch (error) {
    return c.json({
      success: false,
      error: `Failed to process evolution: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: Date.now()
    }, 500);
  }
});

// System stats
app.get('/api/system/stats', async (c) => {
  try {
    const stats = await schedulerService.getSystemStats();
    return c.json(stats, stats.success ? 200 : 500);
  } catch (error) {
    return c.json({
      success: false,
      error: `Failed to get system stats: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: Date.now()
    }, 500);
  }
});

// API Documentation endpoint
app.get('/api/docs', (c) => {
  return c.json({
    title: 'La Red de Autómatas - Backend API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health - Health check',
      users: {
        register: 'POST /api/users/register - Register new user and create Emisario',
        get: 'GET /api/users/:address - Get user information',
        updatePublicKey: 'PUT /api/users/:address/public-key - Update user public encryption key',
        search: 'GET /api/users/search?q=query - Search users by name or address'
      },
      messages: {
        create: 'POST /api/messages - Create delayed message',
        getByAddress: 'GET /api/messages/:address - Get messages for address',
        stats: 'GET /api/messages/stats - Get queue statistics'
      },
      bonds: {
        create: 'POST /api/bonds/create - Create new bond between users',
        get: 'GET /api/bonds/:bondId - Get bond information',
        grantXP: 'POST /api/bonds/:bondId/grant-xp - Grant XP to user'
      },
      scheduler: {
        processQueue: 'POST /api/scheduler/process-queue - Process message queue',
        processBonds: 'POST /api/scheduler/process-bonds - Process bond evolutions',
        maintenance: 'POST /api/scheduler/maintenance - Run maintenance tasks'
      },
      transactions: {
        status: 'GET /api/transactions/:txId/status - Get transaction status'
      },
      ai: {
        generateReport: 'POST /api/ai/generate-report - Generate mission report',
        generateArt: 'POST /api/ai/generate-art - Generate bond art',
        processEvolution: 'POST /api/ai/process-evolution/:bondId - Process bond evolution'
      },
      system: {
        stats: 'GET /api/system/stats - Get system statistics'
      }
    },
    examples: {
      registerUser: {
        method: 'POST',
        url: '/api/users/register',
        body: {
          address: '0x1234567890abcdef',
          displayName: 'Mi Nombre Emisario',
          publicKey: 'optional_encryption_key'
        }
      },
      createMessage: {
        method: 'POST',
        url: '/api/messages',
        body: {
          recipientAddress: '0x1234567890abcdef',
          encryptedContent: 'mensaje_cifrado_base64',
          delayMinutes: 30
        }
      },
      createBond: {
        method: 'POST',
        url: '/api/bonds/create',
        body: {
          initiatorAddress: '0x1111111111111111',
          partnerAddress: '0x2222222222222222'
        }
      }
    }
  });
});

// User registration and management API
app.post('/api/users/register', async (c) => {
  try {
    const body = await c.req.json();
    const { address, displayName, publicKey } = body;

    if (!address) {
      return c.json({
        success: false,
        error: 'address is required'
      }, 400);
    }

    // Create Emisario on Flow blockchain
    const transaction = await flowService.createEmisario(address);
    
    // Store user data in Firestore
    const user = await messageService.createUser(address, displayName, publicKey);

    return c.json({
      success: true,
      data: {
        user,
        transaction
      },
      timestamp: Date.now()
    });
  } catch (error) {
    return c.json({
      success: false,
      error: `Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: Date.now()
    }, 500);
  }
});

app.get('/api/users/:address', async (c) => {
  try {
    const address = c.req.param('address');
    const user = await messageService.getUser(address);

    if (!user) {
      return c.json({
        success: false,
        error: 'User not found'
      }, 404);
    }

    return c.json({
      success: true,
      data: user,
      timestamp: Date.now()
    });
  } catch (error) {
    return c.json({
      success: false,
      error: `Failed to fetch user: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: Date.now()
    }, 500);
  }
});

app.put('/api/users/:address/public-key', async (c) => {
  try {
    const address = c.req.param('address');
    const body = await c.req.json();
    const { publicKey } = body;

    if (!publicKey) {
      return c.json({
        success: false,
        error: 'publicKey is required'
      }, 400);
    }

    // Update on blockchain
    const transaction = await flowService.setPublicKey(address, publicKey);
    
    // Update in database
    await messageService.updateUserPublicKey(address, publicKey);

    return c.json({
      success: true,
      data: { transaction },
      timestamp: Date.now()
    });
  } catch (error) {
    return c.json({
      success: false,
      error: `Failed to update public key: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: Date.now()
    }, 500);
  }
});

app.get('/api/users/search', async (c) => {
  try {
    const query = c.req.query('q');
    const limit = parseInt(c.req.query('limit') || '20');

    if (!query) {
      return c.json({
        success: false,
        error: 'Query parameter "q" is required'
      }, 400);
    }

    const users = await messageService.searchUsers(query, limit);

    return c.json({
      success: true,
      data: users,
      timestamp: Date.now()
    });
  } catch (error) {
    return c.json({
      success: false,
      error: `Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: Date.now()
    }, 500);
  }
});

// Bond creation (when users start chatting)
app.post('/api/bonds/create', async (c) => {
  try {
    const body = await c.req.json();
    const { initiatorAddress, partnerAddress } = body;

    if (!initiatorAddress || !partnerAddress) {
      return c.json({
        success: false,
        error: 'initiatorAddress and partnerAddress are required'
      }, 400);
    }

    // Create bond on blockchain
    const transaction = await flowService.forgeBond(initiatorAddress, partnerAddress);

    return c.json({
      success: true,
      data: { transaction },
      timestamp: Date.now()
    });
  } catch (error) {
    return c.json({
      success: false,
      error: `Failed to create bond: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: Date.now()
    }, 500);
  }
});

// 404 handler
app.notFound((c) => {
  return c.json({
    success: false,
    error: 'Endpoint not found',
    timestamp: Date.now()
  }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return c.json({
    success: false,
    error: 'Internal server error',
    timestamp: Date.now()
  }, 500);
});

export default app;