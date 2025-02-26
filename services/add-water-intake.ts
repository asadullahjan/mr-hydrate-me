import { db } from '@/firebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { increment, arrayUnion } from 'firebase/firestore';
import moment from 'moment';


export const addWaterIntake = async ({ userId, amount, date = new Date() }: { userId: string, amount: number, date?: Date }) => {
  const dateKey = moment(date).format('YYYY-MM-DD');
  const timestamp = date.toISOString();
  const dayRef = doc(db, `users/${userId}/dailyRecords/${dateKey}`);

  const docSnap = await getDoc(dayRef);
  const currentData = docSnap.exists() ? docSnap.data() : { totalAmount: 0 };

  const newCompletedAmount = currentData.completedAmount + amount;
  const newPercentage = Math.min((newCompletedAmount / currentData.totalAmount) * 100, 100);

  await setDoc(dayRef, {
    date: moment(dateKey).startOf('day').toDate(),
    completedAmount: newCompletedAmount,
    percentage: newPercentage.toFixed(0),
    entries: arrayUnion({ id: timestamp, time: timestamp, amount }),
  }, { merge: true });

  return { percentage: newPercentage };
};