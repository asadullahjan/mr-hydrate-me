import { User } from "@/components/auth/AuthProvider";
import { db } from "@/firebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { arrayUnion } from "firebase/firestore";
import moment from "moment";

/**
 * Adds water intake to a user's daily record and updates their streak if applicable.
 * @param user - The authenticated user object
 * @param amount - The amount of water to add (in ml)
 * @param date - The date of the intake (default: current date)
 * @returns An object containing the updated percentage
 * @throws Error if user or user.uid is missing
 */
export const addWaterIntake = async ({
  user,
  amount,
  date = new Date(),
}: {
  user: User;
  amount: number;
  date?: Date;
}) => {
  // Validate input
  if (!user || !user.uid) {
    throw new Error("User is not authenticated or missing UID");
  }

  // Format date and prepare references
  const dateKey = moment(date).format("YYYY-MM-DD");
  const timestamp = date.toISOString();
  const dayRef = doc(db, `users/${user.uid}/dailyRecords/${dateKey}`);
  const userRef = doc(db, `users/${user.uid}`);

  // Fetch existing data
  const daySnap = await getDoc(dayRef);
  const userSnap = await getDoc(userRef);

  const currentData = daySnap.exists()
    ? daySnap.data()
    : { totalAmount: 2000, completedAmount: 0 }; // Default goal: 2000ml
  const userData = userSnap.exists()
    ? userSnap.data()
    : { lastStreakUpdate: null, currentStreak: 0 };

  // Calculate new values
  const newCompletedAmount = (currentData.completedAmount || 0) + amount;
  const newPercentage = Math.min((newCompletedAmount / currentData.totalAmount) * 100, 100);
  const roundedPercentage = Math.round(newPercentage);

  // Update daily record
  await setDoc(
    dayRef,
    {
      date: moment(dateKey).startOf("day").toDate(),
      completedAmount: newCompletedAmount,
      percentage: roundedPercentage,
      entries: arrayUnion({ id: timestamp, time: timestamp, amount }),
    },
    { merge: true }
  );

  // Update streak if goal is met
  if (roundedPercentage >= 100) {
    const lastStreakDate = userData.lastStreakUpdate
      ? moment(userData.lastStreakUpdate)
      : null;
    const currentDate = moment(date);
    const yesterday = currentDate.clone().subtract(1, "day");

    let newStreak = userData.currentStreak || 0;
    const lastStreakUpdate = currentDate.toDate();

    if (lastStreakDate?.isSame(yesterday, "day")) {
      newStreak += 1; // Continue streak
    } else if (!lastStreakDate?.isSame(currentDate, "day")) {
      newStreak = 1; // Start new streak
    }

    await setDoc(
      userRef,
      { lastStreakUpdate, currentStreak: newStreak },
      { merge: true }
    );
  }

  return { percentage: roundedPercentage };
};