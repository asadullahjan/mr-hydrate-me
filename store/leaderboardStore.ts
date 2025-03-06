import { create } from "zustand";
import { db } from "@/firebaseConfig";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";

// Define interfaces for type safety
interface LeaderboardEntry {
  id: string;
  name: string;
  streak: number;
}

interface UserRank {
  position: number;
  totalUsers: number;
}

interface LeaderboardState {
  leaderboard: LeaderboardEntry[];
  userRank: UserRank | null;
  loading: boolean;
  fetchLeaderboard: (userId: string) => Promise<void>;
}

/**
 * Zustand store for managing leaderboard data and user rank.
 */
export const useLeaderboardStore = create<LeaderboardState>((set) => ({
  leaderboard: [],
  userRank: null,
  loading: true,

  /**
   * Fetches the top 10 leaderboard entries and the user's rank from Firestore.
   * @param userId - The ID of the current user
   * @throws Error if Firestore operations fail (logged but not propagated)
   */
  fetchLeaderboard: async (userId: string) => {
    set({ loading: true });

    // Fetch top 10 users by streak
    const usersRef = collection(db, "users");
    const topQuery = query(usersRef, orderBy("currentStreak", "desc"), limit(10));
    const topSnapshot = await getDocs(topQuery);

    const leaderboard: LeaderboardEntry[] = topSnapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().profile?.name || "Unknown", // Fallback for missing name
      streak: doc.data().currentStreak || 0, // Fallback for missing streak
    }));

    // Fetch all users to determine rank
    const allUsersSnapshot = await getDocs(query(usersRef, orderBy("currentStreak", "desc")));
    const allUsers = allUsersSnapshot.docs.map((doc) => ({
      id: doc.id,
      streak: doc.data().currentStreak || 0,
    }));

    const userPosition = allUsers.findIndex((user) => user.id === userId) + 1; // 1-based rank

    set({
      leaderboard,
      userRank: { position: userPosition, totalUsers: allUsers.length },
      loading: false,
    });
  },
}));