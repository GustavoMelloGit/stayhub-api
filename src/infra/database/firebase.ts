import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { env } from '../config/environments';

const firebaseConfig = {
  apiKey: env.API_KEY,
  authDomain: env.AUTH_DOMAIN,
  projectId: env.PROJECT_ID,
  storageBucket: env.STORAGE_BUCKET,
  messagingSenderId: env.MESSAGING_SENDER_ID,
  appId: env.APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
