import { create } from "zustand";
import { db } from "@/firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Alert } from "react-native";
import moment from "moment";

export type WaterEntry = {
  id: string;
  amount: number;
  time: string;
};

export type DailyRecord = {
  date: string;
  baseGoal: number;
  completedAmount: number;
  totalAmount: number;
  weatherAdjustment: number;
  lastUpdated: string;
  percentage: number;
  entries: WaterEntry[];
};

type HistoryStore = {
  history: Record<string, DailyRecord>; // Object with date as key
  loading: boolean;
  fetchHistory: (userId: string, startDate: Date, endDate: Date) => Promise<void>;
};

export const useUserHistoryStore = create<HistoryStore>((set) => ({
  history: {},
  loading: false,
  fetchHistory: async (userId, startDate, endDate) => {
    set({ loading: true });

    try {
      const recordsRef = collection(db, `/users/${userId}/dailyRecords`);
      const q = query(recordsRef, where("date", ">=", startDate), where("date", "<=", endDate));

      const snapshot = await getDocs(q);

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
              id: entry.id,
              amount: entry.amount,
              time: entry.time,
            }))
            : [],
        };
      });

      // Fill missing days
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
      console.error("Error fetching user history:", error);
      Alert.alert("Error", "Failed to fetch history: " + (error as Error).message);
      set({ loading: false });
    }
  },
}));