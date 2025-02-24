import { db } from '@/firebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { increment, arrayUnion } from 'firebase/firestore';
import moment from 'moment';

const DAILY_GOAL = 2000;

export const addWaterIntake = async ({ userId, amount, date = new Date() }: { userId: string, amount: number, date?: Date }) => {
  const dateKey = moment(date).format('YYYY-MM-DD');
  const timestamp = date.toISOString();
  const dayRef = doc(db, `intakes/${userId}/dailyRecords/${dateKey}`);

  const docSnap = await getDoc(dayRef);
  const currentData = docSnap.exists() ? docSnap.data() : { totalAmount: 0 };

  const newTotalAmount = currentData.totalAmount + amount;
  const newCompletedAmount = Math.min(newTotalAmount, DAILY_GOAL);
  const newPercentage = Math.min((newCompletedAmount / DAILY_GOAL) * 100, 100);

  await setDoc(dayRef, {
    date: moment(dateKey).startOf('day').toDate(),
    totalAmount: newTotalAmount,
    completedAmount: newCompletedAmount,
    percentage: newPercentage,
    entries: arrayUnion({ id: timestamp, time: timestamp, amount }),
  }, { merge: true });

  return { totalAmount: newTotalAmount, percentage: newPercentage };
};