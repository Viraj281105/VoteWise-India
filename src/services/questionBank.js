const { getFirestore } = require('../config/firebase');

/**
 * Save questions to Firestore questionBank collection, skipping duplicates.
 * @param {Array} questions - Array of question objects
 */
async function saveQuestions(questions) {
  if (!questions || !Array.isArray(questions) || questions.length === 0) return;
  
  const db = getFirestore();
  if (!db) {
    console.warn('[Firestore] Not available — skipping saveQuestions.');
    return;
  }

  const collectionRef = db.collection('questionBank');
  const batch = db.batch();
  let added = 0;

  for (const q of questions) {
    // Check for duplicates by question text
    const snapshot = await collectionRef.where('question', '==', q.question).limit(1).get();
    
    if (snapshot.empty) {
      const docRef = collectionRef.doc();
      batch.set(docRef, {
        ...q,
        flagged: false,
        usageCount: 0,
        createdAt: new Date().toISOString()
      });
      added++;
    }
  }

  if (added > 0) {
    await batch.commit();
  }
}

/**
 * Get random questions from Firestore questionBank.
 * @param {string} difficulty 
 * @param {number} count 
 * @returns {Array} Array of question objects
 */
async function getQuestions(difficulty, count) {
  const db = getFirestore();
  if (!db) return [];

  try {
    const snapshot = await db.collection('questionBank')
      .where('difficulty', '==', difficulty)
      .where('flagged', '==', false)
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get();

    if (snapshot.empty) return [];

    const results = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      results.push({ ...data, _docId: doc.id });
    });

    // Shuffle and pick `count`
    for (let i = results.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [results[i], results[j]] = [results[j], results[i]];
    }

    return results.slice(0, count);
  } catch (error) {
    console.error('[Firestore] Error getting questions:', error.message);
    return [];
  }
}

/**
 * Flag a question as not helpful.
 * @param {string} questionId - The Firestore document ID
 */
async function flagQuestion(questionId) {
  const db = getFirestore();
  if (!db) return;
  
  try {
    await db.collection('questionBank').doc(questionId).update({
      flagged: true
    });
  } catch (error) {
    console.error('[Firestore] Error flagging question:', error.message);
  }
}

/**
 * Increment the usage count of a helpful question.
 * @param {string} questionId - The Firestore document ID
 */
async function incrementUsage(questionId) {
  const db = getFirestore();
  if (!db) return;

  try {
    const docRef = db.collection('questionBank').doc(questionId);
    await db.runTransaction(async (t) => {
      const doc = await t.get(docRef);
      if (doc.exists) {
        const newCount = (doc.data().usageCount || 0) + 1;
        t.update(docRef, { usageCount: newCount });
      }
    });
  } catch (error) {
    console.error('[Firestore] Error incrementing usage:', error.message);
  }
}

module.exports = {
  saveQuestions,
  getQuestions,
  flagQuestion,
  incrementUsage
};
