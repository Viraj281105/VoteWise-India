const { getFirestore } = require('../config/firebase');

/**
 * Save a completed quiz attempt to Firestore.
 */
async function saveQuizScore(sessionId, score, total, answers) {
  const db = getFirestore();
  if (!db) {
    console.warn('[Firestore] Not available — score not saved.');
    return { saved: false };
  }

  const docRef = await db.collection('quizScores').add({
    sessionId,
    score,
    total,
    answers,
    timestamp: new Date().toISOString(),
    percentage: Math.round((score / total) * 100),
  });

  return { saved: true, docId: docRef.id };
}

/**
 * Fetch the top N scores, ordered by score desc then timestamp asc.
 */
async function getLeaderboard(limit = 10) {
  const db = getFirestore();
  if (!db) return [];

  const snapshot = await db
    .collection('quizScores')
    .orderBy('score', 'desc')
    .orderBy('timestamp', 'asc')
    .limit(limit)
    .get();

  const leaderboard = [];
  let rank = 1;
  snapshot.forEach((doc) => {
    const data = doc.data();
    leaderboard.push({
      rank: rank++,
      score: data.score,
      total: data.total,
      timestamp: data.timestamp,
    });
  });
  return leaderboard;
}

/**
 * Calculate the percentile rank of a given score against all stored scores.
 */
async function calculatePercentile(score) {
  const db = getFirestore();
  if (!db) return { percentile: 100, rank: 1 };

  const snapshot = await db.collection('quizScores').get();
  const total = snapshot.size;
  if (total === 0) return { percentile: 100, rank: 1 };

  let belowCount = 0;
  snapshot.forEach((doc) => {
    if (doc.data().score < score) belowCount++;
  });

  return {
    percentile: Math.round((belowCount / total) * 100),
    rank: total - belowCount,
  };
}

/**
 * Log a chat exchange to Firestore for audit / analytics.
 */
async function saveChatSession(sessionId, userMessage, botReply) {
  const db = getFirestore();
  if (!db) return;

  await db.collection('chatSessions').add({
    sessionId,
    userMessage,
    botReply,
    timestamp: new Date().toISOString(),
  });
}

module.exports = { saveQuizScore, getLeaderboard, calculatePercentile, saveChatSession };
