import { db } from '@/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import moment from 'moment';

export const getTodayProgress = async ({ userId }: { userId: string }) => {
  const todayKey = moment().format('YYYY-MM-DD');
  const dayRef = doc(db, `intakes/${userId}/dailyRecords/${todayKey}`);
  const docSnap = await getDoc(dayRef);

  return docSnap.exists() ? {
    totalAmount: docSnap.data().totalAmount || 0,
    percentage: docSnap.data().percentage || 0,
    entries: docSnap.data().entries || [],
  } : { totalAmount: 0, percentage: 0, entries: [] };
};