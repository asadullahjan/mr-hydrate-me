import { useAuth } from "@/components/auth/AuthProvider";
import { FontAwesome } from "@expo/vector-icons";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { ActivityIndicator, Button, Surface, Text, useTheme } from "react-native-paper";
import { ArcProgress } from "@/components/ArcProgress";
import WaterIntakeChart from "@/components/SummaryChart";
import { AddDrinkModal } from "@/components/AddDrinkModal";
import { useEffect, useState } from "react";
import { checkAndUpdateDailyWaterGoal } from "@/services/check-and-update-daily-water-intake";
import { useLeaderboardStore } from "@/store/leaderboardStore";
import moment from "moment";
import { getWeekMonthData } from "@/services/get-week-month-progress";
import { DailyRecord } from "@/store/userHistoryStore";
import { router } from "expo-router";
import { useLocation } from "@/components/location/LocationProvider";

/**
 * Home screen displays a user's daily water intake progress, weekly summary,
 * leaderboard rank, and streak, with an option to add water intake.
 */
const Home = () => {
  // State for daily and weekly data
  const [todayData, setTodayData] = useState<DailyRecord | undefined>(undefined);
  const [weeklyHistory, setWeeklyHistory] = useState<any>(); // Type this based on getWeekMonthData response
  const [isLoading, setIsLoading] = useState(false);
  const [isWeeklyHistoryLoading, setIsWeeklyHistoryLoading] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);

  // Hooks for theme, auth, leaderboard, and location
  const { colors } = useTheme(); // Access theme colors for styling
  const { user } = useAuth(); // Get authenticated user
  const { userRank, fetchLeaderboard } = useLeaderboardStore(); // Leaderboard data
  const { location, requestPermission } = useLocation(); // Location data

  // Fetch leaderboard data when user changes
  useEffect(() => {
    if (user?.uid) {
      fetchLeaderboard(user.uid);
    }
  }, [user?.uid, fetchLeaderboard]);

  // Fetch today's water intake data
  const fetchTodayData = async () => {
    if (!user?.uid) return;
    setIsLoading(true);
    try {
      const data = await checkAndUpdateDailyWaterGoal(user.uid, location);
      setTodayData(data);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to fetch daily record. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch weekly history data
  const fetchWeeklyHistory = async () => {
    if (!user?.uid) return;
    setIsWeeklyHistoryLoading(true);
    try {
      const data = await getWeekMonthData({
        userId: user.uid,
        duration: {
          startDate: moment().startOf("isoWeek").toDate(),
          endDate: moment().endOf("isoWeek").toDate(),
        },
      });
      setWeeklyHistory(data);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to fetch weekly history.");
    } finally {
      setIsWeeklyHistoryLoading(false);
    }
  };

  // Fetch data when location or refresh count changes
  useEffect(() => {
    if (location) {
      fetchTodayData();
      fetchWeeklyHistory();
    }
  }, [location, refreshCount, user?.uid]);

  // Request location permission if not set
  useEffect(() => {
    if (user && !user.settings?.location) {
      requestPermission();
    }
  }, [user, user?.settings?.location, requestPermission]);

  // Show loading indicator if initial data is not yet loaded
  if (isLoading && !todayData) {
    return <ActivityIndicator style={styles.loading} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header with user greeting and profile icon */}
      <View style={styles.headingContainer}>
        <Text
          variant="headlineLarge"
          style={styles.heading}
        >
          Hello {user?.profile.name || "User"}
        </Text>
        <FontAwesome
          name="user"
          size={30}
          color="black"
          onPress={() => router.push("/(tabs)/profile")}
        />
      </View>

      {/* Daily status with progress, streak, and leaderboard */}
      <Surface style={[styles.statusContainer, { backgroundColor: colors.background }]}>
        <Text
          variant="bodyLarge"
          style={styles.streakContainer}
        >
          <FontAwesome
            name="fire"
            size={14}
          />{" "}
          {user?.currentStreak || 0} days
        </Text>
        <Text
          variant="bodyLarge"
          style={styles.leaderboardContainer}
        >
          <FontAwesome
            name="trophy"
            size={14}
          />{" "}
          {userRank?.position || 0}th
        </Text>
        <ArcProgress progress={todayData?.percentage || 0} />
        <Text
          variant="labelSmall"
          style={[styles.progressText, { color: colors.primary }]}
        >
          {todayData ? `${todayData.completedAmount} / ${todayData.totalAmount}` : "0 / 0"}
        </Text>
        <AddDrinkModal onComplete={() => setRefreshCount((prev) => prev + 1)}>
          <Button
            mode="outlined"
            style={styles.addButton}
            theme={{ roundness: 10 }}
            icon={() => (
              <FontAwesome
                name="plus"
                size={16}
                color={colors.primary}
              />
            )}
          >
            Add
          </Button>
        </AddDrinkModal>
      </Surface>

      {/* Weekly summary with chart */}
      <View style={styles.weeklySummaryContainer}>
        <Text
          variant="titleLarge"
          style={styles.summaryTitle}
        >
          Weekly Summary
        </Text>
        <WaterIntakeChart
          userId={user?.uid ?? ""}
          data={weeklyHistory}
          loading={isWeeklyHistoryLoading}
          viewMode="week"
        />
      </View>
    </ScrollView>
  );
};

// Styles for the Home component
const styles = StyleSheet.create({
  container: {
    paddingVertical: 40,
    gap: 30,
  },
  headingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  heading: {
    fontWeight: "bold",
  },
  statusContainer: {
    paddingBottom: 10,
    paddingTop: 40,
    alignItems: "center",
  },
  streakContainer: {
    position: "absolute",
    flexDirection: "row",
    gap: 2,
    left: 20,
    top: 10,
    fontWeight: "bold",
    color: "red",
  },
  leaderboardContainer: {
    position: "absolute",
    flexDirection: "row",
    gap: 2,
    right: 20,
    top: 10,
    fontWeight: "bold",
  },
  progressText: {
    marginVertical: 10,
    fontWeight: "bold",
  },
  addButton: {
    width: 100,
  },
  weeklySummaryContainer: {
    paddingHorizontal: 15,
    gap: 20,
  },
  summaryTitle: {
    fontWeight: "bold",
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Home;
