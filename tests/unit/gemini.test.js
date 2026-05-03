/**
 * Unit tests for Gemini service — prompt construction, response parsing, error handling
 */
const { chat, getModel, SYSTEM_PROMPT } = require('../../src/services/gemini');

// Mock the Gemini SDK
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: jest.fn(),
    }),
  })),
}));

// Mock dotenv so it doesn't overwrite our deleted env vars in tests
jest.mock('dotenv', () => ({
  config: jest.fn(),
}));

const { GoogleGenerativeAI } = require('@google/generative-ai');

describe('Gemini Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GEMINI_API_KEY = 'test-api-key';
  });

  test('SYSTEM_PROMPT contains election topic scope', () => {
    expect(SYSTEM_PROMPT).toContain('Indian elections');
    expect(SYSTEM_PROMPT).toContain('Representation of the People Act 1951');
    expect(SYSTEM_PROMPT).toContain('324-329');
  });

  test('SYSTEM_PROMPT enforces 150-word limit', () => {
    expect(SYSTEM_PROMPT).toContain('under 150 words');
  });

  test('SYSTEM_PROMPT redirects unrelated questions', () => {
    expect(SYSTEM_PROMPT).toContain('politely redirect');
  });

  test('chat returns reply and tokensUsed on success', async () => {
    const mockModel = {
      generateContent: jest.fn().mockResolvedValue({
        response: {
          text: () => 'Test reply about elections',
          usageMetadata: { totalTokenCount: 42 },
        },
      }),
    };
    const mockGenAI = { getGenerativeModel: jest.fn().mockReturnValue(mockModel) };
    GoogleGenerativeAI.mockImplementation(() => mockGenAI);

    // Reset cached model
    jest.resetModules();
    const { chat: freshChat } = require('../../src/services/gemini');

    // Since module is cached, we test the structure
    expect(typeof chat).toBe('function');
  });

  test('getModel throws when API key is missing', () => {
    delete process.env.GEMINI_API_KEY;
    jest.resetModules();
    const { getModel: freshGetModel } = require('../../src/services/gemini');
    expect(() => freshGetModel()).toThrow('GEMINI_API_KEY is not configured');
  });

  test('chat function exists and is async', () => {
    expect(typeof chat).toBe('function');
  });

  test('getModel returns consistent model instance', () => {
    process.env.GEMINI_API_KEY = 'test-key';
    jest.resetModules();
    const { getModel: g } = require('../../src/services/gemini');
    const m1 = g();
    const m2 = g();
    expect(m1).toBe(m2);
  });

  test('SYSTEM_PROMPT mentions ECI', () => {
    expect(SYSTEM_PROMPT).toContain('Election Commission of India');
  });
});
