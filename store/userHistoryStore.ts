import { create } from "zustand";
import { db } from "@/firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import moment from "moment";

// Define interfaces for type safety
export interface WaterEntry {
  id: string;
  amount: number;
  time: string;
}

export interface DailyRecord {
  date: string;
  baseGoal: number;
  completedAmount: number;
  totalAmount: number;
  weatherAdjustment: number;
  lastUpdated: string;
  percentage: number;
  entries: WaterEntry[];
}

interface HistoryStore {
  history: Record<string, DailyRecord>;
  loading: boolean;
  fetchHistory: (userId: string, startDate: Date, endDate: Date) => Promise<void>;
}

/**
 * Zustand store for managing user water intake history.
 */
export const useUserHistoryStore = create<HistoryStore>((set) => ({
  history: {},
  loading: false,

  /**
   * Fetches user water intake history for a specified date range from Firestore.
   * @param userId - The ID of the user whose history is fetched
   * @param startDate - The start date of the range
   * @param endDate - The end date of the range
   * @throws Error if Firestore operations fail (caught and alerted)
   */
  fetchHistory: async (userId: string, startDate: Date, endDate: Date) => {
    set({ loading: true });

    try {
      // Query Firestore for daily records within the date range
      const recordsRef = collection(db, `users/${userId}/dailyRecords`);
      const q = query(
        recordsRef,
        where("date", ">=", moment(startDate).startOf("day").toDate()),
        where("date", "<=", moment(endDate).endOf("day").toDate())
      );
      const snapshot = await getDocs(q);

      // Process snapshot into history data
      const historyData: Record<string, DailyRecord> = {};
      snapshot.forEach((doc) => {
        const data = doc.data();
        historyData[doc.id] = {
          date: doc.id,
          baseGoal: data.baseGoal || 0,
          completedAmount: data.completedAmount || 0,
          totalAmount: data.totalAmount || 0,
          weatherAdjustment: data.weatherAdjustment || 0,
          lastUpdated: data.lastUpdated?.toDate()?.toISOString() || "",
          percentage: data.percentage || 0,
          entries: Array.isArray(data.entries)
            ? data.entries.map((entry: any) => ({
              id: entry.id || "",
              amount: entry.amount || 0,
              time: entry.time || "",
            }))
            : [],
        };
      });

      // Fill missing days with default records
      for (let m = moment(startDate); m.isSameOrBefore(endDate); m.add(1, "days")) {
        const dateKey = m.format("YYYY-MM-DD");
        if (!(dateKey in historyData)) {
          historyData[dateKey] = {
            date: dateKey,
            baseGoal: 0,
            completedAmount: 0,
            totalAmount: 0,
            weatherAdjustment: 0,
            lastUpdated: "",
            percentage: 0,
            entries: [],
          };
        }
      }

      set({ history: historyData, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Error fetching user history:", error);
      set({ history: {}, loading: false }); // Reset history on error
    }
  },
}));