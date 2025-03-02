import { db } from "@/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import moment from "moment";

// Firebase data fetching functions
export const getWeekMonthData = async ({ userId, duration }: { userId: string; duration: { startDate: Date, endDate: Date } }) => {
  const start = moment(duration.startDate)
    .toDate(); // Monday
  const end = moment(duration.endDate)
    .toDate(); // Sunday

  const recordsRef = collection(db, `/users/${userId}/dailyRecords`);
  const q = query(recordsRef, where("date", ">=", start), where("date", "<=", end));

  const snapshot = await getDocs(q);

  const Data = {} as any;

  snapshot.forEach((doc) => {
    Data[doc.id] = {
      totalAmount: doc.data().totalAmount || 0,
      percentage: doc.data().percentage || 0,
    };
  });

  // Fill in missing days with 0
  for (let m = moment(start); m.isBefore(end); m.add(1, "days")) {
    const dateKey = m.format("YYYY-MM-DD");
    if (!(dateKey in Data)) {
      Data[dateKey] = { totalAmount: 0, percentage: 0 };
    }
  }

  return Data;
};