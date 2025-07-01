import { MessageService } from '../message.service';

// Mock Firestore
jest.mock('@google-cloud/firestore', () => {
  return {
    Firestore: jest.fn().mockImplementation(() => ({
      collection: jest.fn().mockReturnThis(),
      add: jest.fn().mockResolvedValue({ id: 'mock-message-id' }),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({
        empty: false,
        size: 0,
        forEach: jest.fn(),
        docs: []
      }),
      doc: jest.fn().mockReturnThis(),
      update: jest.fn().mockResolvedValue({}),
      count: jest.fn().mockReturnThis()
    }))
  };
});

describe('MessageService', () => {
  let messageService: MessageService;

  beforeEach(() => {
    messageService = new MessageService();
  });

  describe('createMessage', () => {
    it('should create a message with delay', async () => {
      const result = await messageService.createMessage(
        '0x1234567890abcdef',
        'encrypted_content',
        30
      );

      expect(result.success).toBe(true);
      expect(result.data?.messageId).toBe('mock-message-id');
      expect(result.data?.deliveryTimestamp).toBeGreaterThan(Date.now());
    });

    it('should create a message without delay', async () => {
      const result = await messageService.createMessage(
        '0x1234567890abcdef',
        'encrypted_content'
      );

      expect(result.success).toBe(true);
      expect(result.data?.messageId).toBe('mock-message-id');
    });
  });

  describe('getReadyMessages', () => {
    it('should return empty array when no messages are ready', async () => {
      const messages = await messageService.getReadyMessages();
      expect(Array.isArray(messages)).toBe(true);
      expect(messages.length).toBe(0);
    });
  });

  describe('markMessageAsProcessed', () => {
    it('should mark message as processed', async () => {
      const result = await messageService.markMessageAsProcessed('test-id');
      expect(result).toBe(true);
    });
  });
});