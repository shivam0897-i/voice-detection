import {
  collection,
  doc,
  getDoc,
  setDoc,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

// Free tier constants
export const FREE_TIER_LIMIT = 20;

/**
 * Ensures the user profile exists in Firestore and returns it.
 * Tracks their subscription tier (defaults to "free") and usage.
 */
export async function getUserProfile(user) {
  if (!user?.uid) throw new Error('User not authenticated');
  
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return userSnap.data();
  }

  // Create default profile for new users
  const newProfile = {
    email: user.email,
    displayName: user.displayName || 'Security Analyst',
    createdAt: serverTimestamp(),
    tier: 'free',
    analysesUsed: 0,
    analysesLimit: FREE_TIER_LIMIT,
  };

  await setDoc(userRef, newProfile);
  return newProfile;
}

/**
 * Saves a new voice analysis result to the user's history collection
 * and increments their usage counter.
 */
export async function saveAnalysisResult(user, payload) {
  if (!user?.uid) throw new Error('User not authenticated');
  
  // 1. Check usage limits first
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) await getUserProfile(user); // Ensure profile exists
  
  const userData = userSnap.exists() ? userSnap.data() : { analysesUsed: 0, analysesLimit: FREE_TIER_LIMIT };
  if (userData.analysesUsed >= userData.analysesLimit && userData.tier === 'free') {
    throw new Error('You have reached your free tier limit. Please upgrade to continue analyzing voices.');
  }

  // 2. Save the analysis
  const analysesRef = collection(db, 'users', user.uid, 'analyses');
  const now = new Date();
  
  // Extract essential fields
  const summary = payload.summary || {};
  const docData = {
    createdAt: serverTimestamp(),
    timestamp: now.toISOString(),
    fileName: payload.voice_probe?.fileName || 'Live Audio Stream',
    duration: summary.duration_seconds || null,
    classification: summary.final_call_label || 'UNKNOWN',
    riskScore: summary.max_risk_score || 0,
    mode: payload.mode || 'REALTIME',
    language: payload.latest?.language || 'Auto',
    alertCount: Array.isArray(payload.alerts) ? payload.alerts.length : 0
  };

  await addDoc(analysesRef, docData);

  // 3. Increment usage limit
  await setDoc(userRef, { 
    analysesUsed: userData.analysesUsed + 1,
    lastActivity: serverTimestamp()
  }, { merge: true });

  return docData;
}

/**
 * Retrieves the user's past analyses, ordered by newest first.
 */
export async function getUserHistory(user, maxLimit = 50) {
  if (!user?.uid) return [];
  
  const analysesRef = collection(db, 'users', user.uid, 'analyses');
  const q = query(analysesRef, orderBy('createdAt', 'desc'), limit(maxLimit));
  
  const snapshot = await getDocs(q);
  const history = [];
  snapshot.forEach((doc) => {
    history.push({ id: doc.id, ...doc.data() });
  });
  
  return history;
}
