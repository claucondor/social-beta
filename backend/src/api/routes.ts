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

    // Store user data in Firestore (backend responsibility)
    const user = await messageService.createUser(address, displayName, publicKey);

    // Return transaction code for frontend to execute
    const transactionCode = `
      import ClandestineNetwork from 0x2444e6b4d9327f09

      transaction {
        prepare(signer: auth(Storage, Capabilities) &Account) {
          // Check if account already has an Emisario
          if signer.storage.borrow<&ClandestineNetwork.Emisario>(from: ClandestineNetwork.EmisarioStoragePath) != nil {
            panic("Account already has an Emisario")
          }

          // Create new Emisario
          let newEmisario <- ClandestineNetwork.createEmisario()
          
          // Store it in the account
          signer.storage.save(<-newEmisario, to: ClandestineNetwork.EmisarioStoragePath)
          
          // Create ClaimTicket collection if it doesn't exist
          if signer.storage.borrow<&ClandestineNetwork.Collection>(from: ClandestineNetwork.ClaimCollectionStoragePath) == nil {
            let collection <- ClandestineNetwork.createEmptyCollection()
            signer.storage.save(<-collection, to: ClandestineNetwork.ClaimCollectionStoragePath)
            
            // Create a public capability for the collection
            let cap = signer.capabilities.storage.issue<&{NonFungibleToken.Collection}>(ClandestineNetwork.ClaimCollectionStoragePath)
            signer.capabilities.publish(cap, at: ClandestineNetwork.ClaimCollectionPublicPath)
          }
        }
      }
    `;

    return c.json({
      success: true,
      data: {
        user,
        transactionCode, // Frontend ejecuta esto
        message: "Execute the transaction with your wallet to create your Emisario on-chain"
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

    // Update in database (backend responsibility)
    await messageService.updateUserPublicKey(address, publicKey);

    // Return transaction code for frontend to execute
    const transactionCode = `
      import ClandestineNetwork from 0x2444e6b4d9327f09

      transaction(newPublicKey: String) {
        let emisarioRef: &ClandestineNetwork.Emisario

        prepare(signer: auth(Storage) &Account) {
          self.emisarioRef = signer.storage.borrow<&ClandestineNetwork.Emisario>(from: ClandestineNetwork.EmisarioStoragePath)
            ?? panic("Emisario resource not found. Please run setup_account.cdc first")
        }

        execute {
          self.emisarioRef.setPublicKey(newKey: newPublicKey)
        }
      }
    `;

    return c.json({
      success: true,
      data: { 
        transactionCode,
        args: [publicKey],
        message: "Execute this transaction with your wallet to update your public key on-chain"
      },
      timestamp: Date.now()
    });
  } catch (error) {
    return c.json({
      success: false,
      error: `Failed to prepare public key update: ${error instanceof Error ? error.message : 'Unknown error'}`,
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

    // Return transaction code for frontend to execute
    const transactionCode = `
      import ClandestineNetwork from 0x2444e6b4d9327f09
      import NonFungibleToken from 0x1d7e57aa55817448

      transaction(partnerAddress: Address) {
        let initiatorEmisarioRef: &ClandestineNetwork.Emisario
        let initiatorCollectionRef: &{NonFungibleToken.Collection}
        let partnerCollectionCap: Capability<&{NonFungibleToken.Collection}>

        prepare(initiator: auth(Storage, Capabilities) &Account) {
          self.initiatorEmisarioRef = initiator.storage.borrow<&ClandestineNetwork.Emisario>(from: ClandestineNetwork.EmisarioStoragePath)
            ?? panic("Initiator's Emisario resource not found. Please run setup_account.cdc")

          self.initiatorCollectionRef = initiator.storage.borrow<&{NonFungibleToken.Collection}>(from: ClandestineNetwork.ClaimCollectionStoragePath)
            ?? panic("Initiator's ClaimTicket Collection not found. Please run setup_account.cdc")

          self.partnerCollectionCap = getAccount(partnerAddress).capabilities.get<&{NonFungibleToken.Collection}>(ClandestineNetwork.ClaimCollectionPublicPath)
          
          if !self.partnerCollectionCap.check() {
            panic("Partner's ClaimTicket Collection capability is not valid or has not been published.")
          }
        }

        execute {
          let tickets <- ClandestineNetwork.forgeBondSimple(
            emisario1: self.initiatorEmisarioRef,
            owner1: self.initiatorEmisarioRef.owner!.address,
            owner2: partnerAddress
          )

          // Distribute the Claim Tickets
          let partnerCollection = self.partnerCollectionCap.borrow()
            ?? panic("Could not borrow partner's collection.")
          partnerCollection.deposit(token: <- tickets.removeFirst())

          self.initiatorCollectionRef.deposit(token: <- tickets.removeFirst())

          destroy tickets
        }
      }
    `;

    return c.json({
      success: true,
      data: { 
        transactionCode,
        args: [partnerAddress],
        message: "Execute this transaction with your wallet to create the bond on-chain"
      },
      timestamp: Date.now()
    });
  } catch (error) {
    return c.json({
      success: false,
      error: `Failed to prepare bond creation: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: Date.now()
    }, 500);
  }
});

// === ADMINISTRATIVE OPERATIONS (Backend executes with Oracle PK) ===

// Grant XP to user (Admin operation)
app.post('/api/admin/grant-xp', async (c) => {
  try {
    const body = await c.req.json();
    const { recipientAddress, amount, reason } = body;

    if (!recipientAddress || !amount) {
      return c.json({
        success: false,
        error: 'recipientAddress and amount are required'
      }, 400);
    }

    // This is executed by the backend with oracle privileges
    const transaction = await flowService.grantXP(recipientAddress, amount, reason);

    return c.json({
      success: true,
      data: { transaction },
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

// Register new skill (Admin operation)
app.post('/api/admin/register-skill', async (c) => {
  try {
    const body = await c.req.json();
    const { id, branch, maxLevel, levelRequirement, prereqID, description } = body;

    if (!id || !branch || !maxLevel || !levelRequirement || !description) {
      return c.json({
        success: false,
        error: 'id, branch, maxLevel, levelRequirement, and description are required'
      }, 400);
    }

    // This is executed by the backend with oracle privileges
    const transaction = await flowService.registerSkill({
      id,
      branch,
      maxLevel,
      levelRequirement,
      prereqID,
      description
    });

    return c.json({
      success: true,
      data: { transaction },
      timestamp: Date.now()
    });
  } catch (error) {
    return c.json({
      success: false,
      error: `Failed to register skill: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: Date.now()
    }, 500);
  }
});

// === TRANSACTION CODE PROVIDERS (Frontend executes) ===

// Get transaction code for unlocking skills
app.post('/api/transactions/unlock-skill', async (c) => {
  try {
    const body = await c.req.json();
    const { skillID } = body;

    if (!skillID) {
      return c.json({
        success: false,
        error: 'skillID is required'
      }, 400);
    }

    const transactionCode = `
      import ClandestineNetwork from 0x2444e6b4d9327f09
      import SkillRegistry from 0x2444e6b4d9327f09

      transaction(skillID: String) {
        let emisarioRef: &ClandestineNetwork.Emisario
        let skillData: SkillRegistry.SkillData

        prepare(signer: auth(Storage) &Account) {
          self.emisarioRef = signer.storage.borrow<&ClandestineNetwork.Emisario>(from: ClandestineNetwork.EmisarioStoragePath)
            ?? panic("Emisario resource not found. Please run setup_account.cdc")

          self.skillData = SkillRegistry.getSkillData(skillID: skillID)
            ?? panic("Skill with the specified ID is not registered.")
        }

        execute {
          // Check if the user has skill points to spend
          if self.emisarioRef.skillPoints < 1 {
            panic("Not enough skill points. Current: 0")
          }

          // Check if the user meets the level requirement
          if self.emisarioRef.level < self.skillData.levelRequirement {
            panic("Level requirement not met. Required: ".concat(self.skillData.levelRequirement.toString()).concat(", Current: ").concat(self.emisarioRef.level.toString()))
          }
          
          // Check for prerequisites
          let currentSkillLevel = self.emisarioRef.skills[self.skillData.id] ?? 0

          if let prereqID = self.skillData.prereqID {
            if (self.emisarioRef.skills[prereqID] ?? 0) == 0 {
              panic("Prerequisite skill '".concat(prereqID).concat("' not unlocked."))
            }
          }

          // Check if the skill is already at max level
          if currentSkillLevel >= self.skillData.maxLevel {
            panic("Skill is already at max level.")
          }

          // Spend the skill point
          self.emisarioRef.skillPoints = self.emisarioRef.skillPoints - 1

          // Increase the skill level
          self.emisarioRef.skills[self.skillData.id] = currentSkillLevel + 1
        }
      }
    `;

    return c.json({
      success: true,
      data: {
        transactionCode,
        args: [skillID],
        message: "Execute this transaction with your wallet to unlock the skill"
      },
      timestamp: Date.now()
    });
  } catch (error) {
    return c.json({
      success: false,
      error: `Failed to prepare skill unlock: ${error instanceof Error ? error.message : 'Unknown error'}`,
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