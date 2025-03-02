import { create } from "zustand";
import { db } from "@/firebaseConfig";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";

type LeaderboardState = {
  leaderboard: { id: string; name: string; streak: number }[];
  userRank: { position: number; totalUsers: number } | null;
  loading: boolean;
  fetchLeaderboard: (userId: string) => Promise<void>;
};

export const useLeaderboardStore = create<LeaderboardState>((set) => ({
  leaderboard: [],
  userRank: null,
  loading: true,
  fetchLeaderboard: async (userId: string) => {
    set({ loading: true });

    try {
      // Fetch top 10 leaderboard users
      const usersRef = collection(db, "users");
      const q = query(usersRef, orderBy("currentStreak", "desc"), limit(10));
      const querySnapshot = await getDocs(q);
      const leaderboard = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().profile?.name,
        streak: doc.data().currentStreak,
      }));

      // Fetch user's rank
      const allUsersSnapshot = await getDocs(query(usersRef, orderBy("currentStreak", "desc")));
      const allUsers = allUsersSnapshot.docs.map((doc) => ({
        id: doc.id,
        streak: doc.data().currentStreak,
      }));

      const userRank = allUsers.findIndex((user) => user.id === userId) + 1;

      set({ leaderboard, userRank: { position: userRank, totalUsers: allUsers.length }, loading: false });
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      set({ loading: false });
    }
  },
}));
