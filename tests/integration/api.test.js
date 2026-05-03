/**
 * Integration tests for all API routes using Supertest
 */
const request = require('supertest');

// Mock all external services before requiring the app
jest.mock('../../src/config/firebase', () => ({
  initializeFirebase: jest.fn(() => ({ db: null, auth: null })),
  getFirestore: jest.fn(() => null),
  getAuth: jest.fn(() => null),
}));

jest.mock('../../src/services/gemini', () => ({
  chat: jest.fn().mockResolvedValue({ reply: 'Test reply', tokensUsed: 10 }),
  getModel: jest.fn(),
  SYSTEM_PROMPT: 'test',
}));

jest.mock('../../src/services/translate', () => ({
  translateText: jest.fn().mockResolvedValue('अनुवादित'),
  LANG_MAP: { hi: 'hi-IN', ta: 'ta-IN', te: 'te-IN', bn: 'bn-IN' },
}));



jest.mock('../../src/services/firestore', () => ({
  saveQuizScore: jest.fn().mockResolvedValue({ saved: true, docId: 'test' }),
  getLeaderboard: jest.fn().mockResolvedValue([]),
  calculatePercentile: jest.fn().mockResolvedValue({ percentile: 80, rank: 2 }),
  saveChatSession: jest.fn().mockResolvedValue(),
}));

const app = require('../../src/server');
const validUUID = '550e8400-e29b-41d4-a716-446655440000';

describe('GET /health', () => {
  test('returns 200 with status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('returns version string', async () => {
    const res = await request(app).get('/health');
    expect(res.body.version).toBe('1.0.0');
  });

  test('returns ISO timestamp', async () => {
    const res = await request(app).get('/health');
    expect(res.body.timestamp).toBeDefined();
    expect(new Date(res.body.timestamp).toISOString()).toBe(res.body.timestamp);
  });
});

describe('POST /api/chat', () => {
  test('returns 200 with reply on valid input', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ message: 'What is NOTA?', sessionId: validUUID });
    expect(res.status).toBe(200);
    expect(res.body.reply).toBeDefined();
    expect(res.body.tokensUsed).toBeDefined();
  });

  test('returns 400 on missing message', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ sessionId: validUUID });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });

  test('returns 400 on invalid sessionId', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ message: 'Hello', sessionId: 'not-uuid' });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/quiz/submit', () => {
  test('returns 200 with saved and percentile', async () => {
    const res = await request(app)
      .post('/api/quiz/submit')
      .send({
        sessionId: validUUID,
        score: 15,
        total: 20,
        answers: [{ questionId: 1, selected: 0, correct: true }],
      });
    expect(res.status).toBe(200);
    expect(res.body.saved).toBe(true);
    expect(res.body.percentile).toBeDefined();
  });

  test('returns 400 on invalid score', async () => {
    const res = await request(app)
      .post('/api/quiz/submit')
      .send({ sessionId: validUUID, score: 999, total: 20, answers: [] });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/quiz/leaderboard', () => {
  test('returns 200 with leaderboard array', async () => {
    const res = await request(app).get('/api/quiz/leaderboard');
    expect(res.status).toBe(200);
    expect(res.body.leaderboard).toBeDefined();
    expect(Array.isArray(res.body.leaderboard)).toBe(true);
  });
});

describe('POST /api/translate', () => {
  test('returns 200 with translated text', async () => {
    const res = await request(app)
      .post('/api/translate')
      .send({ text: 'Hello', targetLang: 'hi' });
    expect(res.status).toBe(200);
    expect(res.body.translatedText).toBeDefined();
  });

  test('returns 400 on unsupported language', async () => {
    const res = await request(app)
      .post('/api/translate')
      .send({ text: 'Hello', targetLang: 'fr' });
    expect(res.status).toBe(400);
  });
});



describe('Static Files', () => {
  test('serves index.html on root', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('VoteWise India');
  });
});
