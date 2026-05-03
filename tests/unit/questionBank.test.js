const { saveQuestions, getQuestions, flagQuestion } = require('../../src/services/questionBank');
const { generateQuizQuestions } = require('../../src/services/gemini');
const { getFirestore } = require('../../src/config/firebase');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Mock Firebase
jest.mock('../../src/config/firebase', () => ({
  getFirestore: jest.fn(),
}));

// Mock Gemini
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

describe('questionBank Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveQuestions', () => {
    test('skips empty arrays gracefully', async () => {
      await saveQuestions([]);
      await saveQuestions(null);
      expect(getFirestore).not.toHaveBeenCalled();
    });
  });

  describe('getQuestions', () => {
    test('returns correct count', async () => {
      const docs = [
        { id: '1', data: () => ({ question: 'Q1' }) },
        { id: '2', data: () => ({ question: 'Q2' }) },
        { id: '3', data: () => ({ question: 'Q3' }) },
      ];
      
      const mockDb = {
        collection: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue({
              empty: false,
              forEach: (cb) => docs.forEach(cb)
            })
          })
        })
      };
      
      getFirestore.mockReturnValue(mockDb);
      
      const result = await getQuestions('easy', 2);
      expect(result).toHaveLength(2);
    });
  });

  describe('flagQuestion', () => {
    test('calls Firestore update with correct fields', async () => {
      const mockUpdate = jest.fn().mockResolvedValue();
      const mockDb = {
        collection: jest.fn().mockReturnValue({
          doc: jest.fn().mockReturnValue({
            update: mockUpdate
          })
        })
      };
      
      getFirestore.mockReturnValue(mockDb);
      
      await flagQuestion('test-id');
      expect(mockUpdate).toHaveBeenCalledWith({ flagged: true });
    });
  });
});

describe('generateQuizQuestions', () => {
  beforeEach(() => {
    process.env.GEMINI_API_KEY = 'test-api-key';
    jest.clearAllMocks();
  });

  test('returns array with all required fields', async () => {
    const mockJson = `[
      {"id":"q1","question":"test","options":["A","B","C","D"],"correct":0,"explanation":"cite","difficulty":"easy","topic":"voter","source":"AI Generated"}
    ]`;
    
    const mockModel = {
      generateContent: jest.fn().mockResolvedValue({
        response: { text: () => mockJson }
      })
    };
    GoogleGenerativeAI.mockImplementation(() => ({
      getGenerativeModel: () => mockModel
    }));

    const result = await generateQuizQuestions('easy', 'voter', 1);
    expect(result).toHaveLength(1);
    expect(result[0].question).toBe('test');
    expect(result[0].explanation).toBe('cite');
  });

  test('Malformed Gemini JSON response throws and is caught', async () => {
    const mockModel = {
      generateContent: jest.fn().mockResolvedValue({
        response: { text: () => 'Invalid JSON!' }
      })
    };
    GoogleGenerativeAI.mockImplementation(() => ({
      getGenerativeModel: () => mockModel
    }));

    await expect(generateQuizQuestions('easy', 'voter', 1)).rejects.toThrow('Failed to parse Gemini JSON response');
  });
});
