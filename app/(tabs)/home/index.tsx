import { useAuth } from "@/components/Auth/AuthProvider";
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
import { useLocation } from "@/components/Location/LocationProvider";
import * as Notifications from "expo-notifications";
import { SchedulableTriggerInputTypes } from "expo-notifications";

const Home = () => {
  const [todayData, setTodayData] = useState<DailyRecord>();
  const [refresh, setRefresh] = useState(0);
  const { user } = useAuth();
  const theme = useTheme();
  const { userRank, fetchLeaderboard } = useLeaderboardStore();
  const [weeklyHistory, setWeeklyHistory] = useState();
  const [weeklyHistoryLoading, setWeeklyHistoryLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const { location, requestPermission } = useLocation();

  useEffect(() => {
    if (user) {
      fetchLeaderboard(user.uid);
    }
  }, [user]);

  const fetchTodayData = () => {
    setLoading(true);
    checkAndUpdateDailyWaterGoal(user?.uid!, location)
      .then((data) => {
        console.log({ data });

        setTodayData(data);
      })
      .catch((e) => {
        Alert.alert("Error", e.message || "Failed to fetch daily record. Please try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (location) {
      fetchTodayData();
    }
  }, [location, refresh]);

  useEffect(() => {
    setWeeklyHistoryLoading(true);
    getWeekMonthData({
      userId: user?.uid!,
      duration: {
        startDate: moment().startOf("isoWeek").toDate(),
        endDate: moment().endOf("isoWeek").toDate(),
      },
    })
      .then((data) => {
        setWeeklyHistory(data);
      })
      .catch((e) => {
        Alert.alert(e.message);
      })
      .finally(() => {
        setWeeklyHistoryLoading(false);
      });
  }, [refresh]);

  useEffect(() => {
    if (user && !user.settings?.location) {
      requestPermission();
    }
  }, [user, user?.settings?.location]);

  if (loading && !todayData) {
    return <ActivityIndicator style={{ margin: "auto" }} />;
  }

  return (
    <ScrollView>
      <View style={styles.container}>
        <View style={styles.headingContainer}>
          <Text
            variant="headlineLarge"
            style={styles.heading}
          >
            Hello {user?.profile.name}
          </Text>
          <FontAwesome
            name="user"
            size={30}
            color={"black"}
            onPress={() => {
              router.push("/(tabs)/profile");
            }}
          />
        </View>
        <Surface style={[styles.statusContainer, { backgroundColor: theme.colors.background }]}>
          <Text
            variant="bodyLarge"
            style={styles.streakContainer}
          >
            <FontAwesome
              name="fire"
              size={14}
            />{" "}
            {user?.currentStreak || "0"} days
          </Text>
          <Text
            variant="bodyLarge"
            style={styles.leaderBoardContainer}
          >
            <FontAwesome
              name="trophy"
              size={14}
            />{" "}
            {userRank?.position ? userRank?.position : "0"} th
          </Text>
          <ArcProgress progress={todayData?.percentage || 0} />
          <Text
            variant="labelSmall"
            style={{ margin: "auto", color: theme.colors.primary, fontWeight: "bold" }}
          >
            {todayData && `${todayData?.completedAmount} / ${todayData?.totalAmount}`}
          </Text>
          <AddDrinkModal onComplete={() => setRefresh((prev) => prev + 1)}>
            <Button
              mode="outlined"
              style={{ width: 100, margin: "auto" }}
              theme={{ roundness: 10 }}
              icon={() => (
                <FontAwesome
                  name="plus"
                  size={16}
                  color={theme.colors.primary}
                />
              )}
            >
              Add
            </Button>
          </AddDrinkModal>
        </Surface>
        <View style={styles.weeklySummaryContainer}>
          <Text
            variant="titleLarge"
            style={{ fontWeight: "bold" }}
          >
            Weakly Summary
          </Text>
          <WaterIntakeChart
            userId={user?.uid as string}
            data={weeklyHistory}
            loading={weeklyHistoryLoading}
            viewMode="week"
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default Home;

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
  leaderBoardContainer: {
    position: "absolute",
    flexDirection: "row",
    gap: 2,
    right: 20,
    top: 10,
    fontWeight: "bold",
  },
  weeklySummaryContainer: {
    paddingHorizontal: 15,
    gap: 20,
  },
});
