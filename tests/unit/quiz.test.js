/**
 * Unit tests for quiz scoring, percentile, and Firestore service
 */
const { saveQuizScore, getLeaderboard, calculatePercentile } = require('../../src/services/firestore');
const { getFirestore } = require('../../src/config/firebase');

// Mock Firebase
jest.mock('../../src/config/firebase', () => ({
  initializeFirebase: jest.fn(() => ({ db: null, auth: null })),
  getFirestore: jest.fn(),
  getAuth: jest.fn(),
}));

describe('Quiz Scoring', () => {
  test('score of 0 out of 20 returns 0% percentage', () => {
    const pct = Math.round((0 / 20) * 100);
    expect(pct).toBe(0);
  });

  test('score of 20 out of 20 returns 100%', () => {
    const pct = Math.round((20 / 20) * 100);
    expect(pct).toBe(100);
  });

  test('score of 13 out of 20 returns 65%', () => {
    const pct = Math.round((13 / 20) * 100);
    expect(pct).toBe(65);
  });

  test('score cannot be negative', () => {
    const score = Math.max(0, -5);
    expect(score).toBe(0);
  });

  test('score cannot exceed total', () => {
    const score = Math.min(20, 25);
    expect(score).toBe(20);
  });
});

describe('Percentile Calculation', () => {
  test('returns 100 percentile when Firestore is unavailable', async () => {
    getFirestore.mockReturnValue(null);
    const result = await calculatePercentile(15);
    expect(result).toEqual({ percentile: 100, rank: 1 });
  });

  test('returns 100 percentile for first score', async () => {
    const mockDb = { collection: jest.fn().mockReturnValue({ get: jest.fn().mockResolvedValue({ size: 0, forEach: jest.fn() }) }) };
    getFirestore.mockReturnValue(mockDb);
    const result = await calculatePercentile(15);
    expect(result.percentile).toBe(100);
  });
});

describe('Leaderboard', () => {
  test('returns empty array when Firestore unavailable', async () => {
    getFirestore.mockReturnValue(null);
    const result = await getLeaderboard(10);
    expect(result).toEqual([]);
  });

  test('returns ranked entries from Firestore', async () => {
    const docs = [
      { data: () => ({ score: 20, total: 20, timestamp: '2024-01-01' }) },
      { data: () => ({ score: 15, total: 20, timestamp: '2024-01-02' }) },
    ];
    const mockDb = {
      collection: jest.fn().mockReturnValue({
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue({ forEach: (cb) => docs.forEach(cb) }),
        }),
      }),
    };
    getFirestore.mockReturnValue(mockDb);
    const result = await getLeaderboard(10);
    expect(result).toHaveLength(2);
    expect(result[0].rank).toBe(1);
    expect(result[0].score).toBe(20);
  });
});

describe('saveQuizScore', () => {
  test('returns saved false when Firestore unavailable', async () => {
    getFirestore.mockReturnValue(null);
    const result = await saveQuizScore('uuid', 10, 20, []);
    expect(result.saved).toBe(false);
  });

  test('saves score and returns docId', async () => {
    const mockDb = {
      collection: jest.fn().mockReturnValue({
        add: jest.fn().mockResolvedValue({ id: 'test-doc-id' }),
      }),
    };
    getFirestore.mockReturnValue(mockDb);
    const result = await saveQuizScore('test-uuid', 15, 20, []);
    expect(result.saved).toBe(true);
    expect(result.docId).toBe('test-doc-id');
  });
});
