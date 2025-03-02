import { User } from '@/components/Auth/AuthProvider';
import { db } from '@/firebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { arrayUnion } from 'firebase/firestore';
import moment from 'moment';

export const addWaterIntake = async ({ user, amount, date = new Date() }: { user: User, amount: number, date?: Date }) => {
  const dateKey = moment(date).format('YYYY-MM-DD');
  const timestamp = date.toISOString();
  const dayRef = doc(db, `users/${user?.uid}/dailyRecords/${dateKey}`);
  const userRef = doc(db, `users/${user?.uid}`);

  const docSnap = await getDoc(dayRef);
  const userSnap = await getDoc(userRef);

  const currentData = docSnap.exists() ? docSnap.data() : { totalAmount: 2000, completedAmount: 0 }; // Default totalAmount to 2000ml
  const userData = userSnap.exists() ? userSnap.data() : { lastStreakUpdate: null, currentStreak: 0 };

  const newCompletedAmount = (currentData.completedAmount || 0) + amount;
  const newPercentage = Math.min((newCompletedAmount / currentData.totalAmount) * 100, 100);
  const roundedPercentage = Math.round(newPercentage); // Round to nearest integer

  // Save percentage as an integer (number)
  await setDoc(dayRef, {
    date: moment(dateKey).startOf('day').toDate(),
    completedAmount: newCompletedAmount,
    percentage: roundedPercentage, // Store as an integer
    entries: arrayUnion({ id: timestamp, time: timestamp, amount }),
  }, { merge: true });

  // Check for streak update
  if (roundedPercentage >= 100) {
    const lastStreakDate = moment(userData.lastStreakUpdate);
    const yesterday = moment(date).subtract(1, 'day');

    let newStreak = userData.currentStreak || 0;
    let lastStreakUpdate = moment(date).toDate();

    if (lastStreakDate.isSame(yesterday, 'day')) {
      newStreak += 1; // Continue streak
    } else if (!lastStreakDate.isSame(moment(date), 'day')) {
      newStreak = 1; // Reset streak
    }

    await setDoc(userRef, { lastStreakUpdate, currentStreak: newStreak }, { merge: true });
  }

  return { percentage: roundedPercentage };
};