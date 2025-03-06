import { db } from "@/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import moment from "moment";

// Define the return type interface
interface DailyProgress {
  totalAmount: number;
  percentage: number;
  entries: { id: string; time: string; amount: number }[];
}

/**
 * Retrieves the user's water intake progress for today from Firestore.
 * @param userId - The ID of the user whose progress is being fetched
 * @returns An object containing today's total amount, percentage, and entries
 * @throws Error if Firestore operation fails (not caught here)
 */
export const getTodayProgress = async ({ userId }: { userId: string }): Promise<DailyProgress> => {
  // Format today's date and create document reference
  const todayKey = moment().format("YYYY-MM-DD");
  const dayRef = doc(db, `users/${userId}/dailyRecords/${todayKey}`);

  // Fetch today's record
  const daySnap = await getDoc(dayRef);

  // Return progress data or defaults if no record exists
  return daySnap.exists()
    ? {
      totalAmount: daySnap.data().totalAmount || 0,
      percentage: daySnap.data().percentage || 0,
      entries: daySnap.data().entries || [],
    }
    : { totalAmount: 0, percentage: 0, entries: [] };
};