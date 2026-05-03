/**
 * Unit tests for Zod validation middleware — security boundary tests
 */
const { chatSchema, quizSubmitSchema, translateSchema, validate } = require('../../src/middleware/validate');

describe('Chat Schema Validation', () => {
  test('rejects empty message', () => {
    const result = chatSchema.safeParse({ message: '', sessionId: '550e8400-e29b-41d4-a716-446655440000' });
    expect(result.success).toBe(false);
  });

  test('rejects message over 500 chars', () => {
    const longMsg = 'a'.repeat(501);
    const result = chatSchema.safeParse({ message: longMsg, sessionId: '550e8400-e29b-41d4-a716-446655440000' });
    expect(result.success).toBe(false);
  });

  test('rejects invalid UUID sessionId', () => {
    const result = chatSchema.safeParse({ message: 'Hello', sessionId: 'not-a-uuid' });
    expect(result.success).toBe(false);
  });

  test('accepts valid chat input', () => {
    const result = chatSchema.safeParse({ message: 'How do I vote?', sessionId: '550e8400-e29b-41d4-a716-446655440000' });
    expect(result.success).toBe(true);
  });
});

describe('Translate Schema Validation', () => {
  test('rejects unsupported language code', () => {
    const result = translateSchema.safeParse({ text: 'Hello', targetLang: 'fr' });
    expect(result.success).toBe(false);
  });

  test('accepts valid Indian language code', () => {
    const result = translateSchema.safeParse({ text: 'Hello', targetLang: 'hi' });
    expect(result.success).toBe(true);
  });
});



describe('Quiz Submit Schema Validation', () => {
  test('rejects score greater than 30', () => {
    const result = quizSubmitSchema.safeParse({
      sessionId: '123e4567-e89b-12d3-a456-426614174000',
      score: 31,
      total: 30,
      answers: [],
    });
    expect(result.success).toBe(false);
  });

  test('accepts valid quiz submission', () => {
    const result = quizSubmitSchema.safeParse({
      sessionId: '550e8400-e29b-41d4-a716-446655440000',
      score: 15, total: 20,
      answers: [{ questionId: 1, selected: 2, correct: true }],
    });
    expect(result.success).toBe(true);
  });
});

describe('Validate Middleware', () => {
  test('returns 400 for invalid body', () => {
    const middleware = validate(chatSchema);
    const req = { body: { message: '', sessionId: 'bad' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  test('calls next and sets validatedBody for valid input', () => {
    const middleware = validate(chatSchema);
    const req = { body: { message: 'Test', sessionId: '550e8400-e29b-41d4-a716-446655440000' } };
    const res = {};
    const next = jest.fn();

    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.validatedBody).toBeDefined();
  });
});
