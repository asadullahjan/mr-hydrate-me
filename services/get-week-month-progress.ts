import { db } from "@/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import moment from "moment";

// Define the return type interface
interface DailyData {
  totalAmount: number;
  percentage: number;
}

interface DateRange {
  startDate: Date;
  endDate: Date;
}

/**
 * Fetches water intake data for a user over a specified date range from Firestore.
 * @param userId - The ID of the user whose data is being fetched
 * @param duration - Object containing startDate and endDate for the range
 * @returns An object mapping date keys (YYYY-MM-DD) to daily data
 * @throws Error if Firestore operation fails (not caught here)
 */
export const getWeekMonthData = async ({
  userId,
  duration,
}: {
  userId: string;
  duration: DateRange;
}): Promise<Record<string, DailyData>> => {
  // Convert dates to moment objects for consistent handling
  const start = moment(duration.startDate).startOf("day").toDate();
  const end = moment(duration.endDate).endOf("day").toDate();

  // Query Firestore for daily records within the date range
  const recordsRef = collection(db, `users/${userId}/dailyRecords`);
  const q = query(recordsRef, where("date", ">=", start), where("date", "<=", end));
  const snapshot = await getDocs(q);

  // Process snapshot into data object
  const data: Record<string, DailyData> = {};
  snapshot.forEach((doc) => {
    data[doc.id] = {
      totalAmount: doc.data().totalAmount || 0,
      percentage: doc.data().percentage || 0,
    };
  });

  // Fill in missing days with default values
  for (let m = moment(start); m.isSameOrBefore(end); m.add(1, "days")) {
    const dateKey = m.format("YYYY-MM-DD");
    if (!(dateKey in data)) {
      data[dateKey] = { totalAmount: 0, percentage: 0 };
    }
  }

  return data;
};