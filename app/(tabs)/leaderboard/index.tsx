import { useAuth } from "@/components/Auth/AuthProvider";
import { useLeaderboardStore } from "@/store/leaderboardStore";
import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { View, StyleSheet, ScrollView, Text } from "react-native";
import {
  Card,
  Text as PaperText,
  Button,
  Avatar,
  ActivityIndicator,
  useTheme,
} from "react-native-paper";

const LeaderBoard = () => {
  const { leaderboard, userRank, loading, fetchLeaderboard } = useLeaderboardStore();
  const { user } = useAuth();
  const theme = useTheme();

  useEffect(() => {
    fetchLeaderboard(user?.uid!);
  }, [fetchLeaderboard, user]);

  if (loading) {
    return <ActivityIndicator style={{ margin: "auto" }} />;
  }

  // Check if there are any users with streaks or data (excluding the current user if needed)
  const hasLeaderboardData =
    leaderboard.length > 1 || // More than just the current user
    (leaderboard.length === 1 && leaderboard[0].streak > 0); // Current user has a streak

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Leaderboard</Text>

      {hasLeaderboardData ? (
        <>
          {/* Top 3 Positions */}
          <View style={styles.leaderboardTop}>
            {[leaderboard[1], leaderboard[0], leaderboard[2]].map((user, index) => {
              if (!user || !user.name || user.streak === 0) return null; // Skip users with no streaks
              return (
                <Card
                  key={user.id}
                  style={[
                    styles.topPositionsContainer,
                    index === 1
                      ? { ...styles.middleCard, backgroundColor: theme.colors.primary }
                      : { ...styles.sideCard, backgroundColor: theme.colors.secondary },
                    index === 0 && { borderTopEndRadius: 0 },
                    index === 2 && { borderTopStartRadius: 0 },
                  ]}
                >
                  <PaperText
                    style={styles.name}
                    variant="titleMedium"
                  >
                    {user.name || "User"}
                  </PaperText>
                  <PaperText style={[styles.streak]}>{user.streak} days</PaperText>
                  {index === 1 && (
                    <MaterialCommunityIcons
                      size={35}
                      name="crown"
                      style={styles.crown}
                    />
                  )}
                </Card>
              );
            })}
          </View>

          <View style={styles.userSection}>
            {userRank && (
              <Card
                style={[styles.fullWidthCard, { backgroundColor: theme.colors.secondary }]} // Updated to fullWidthCard
                contentStyle={styles.cardContent}
              >
                <PaperText
                  style={styles.rank}
                  variant="bodyLarge"
                >
                  #{userRank.position}
                </PaperText>
                <PaperText
                  style={styles.name}
                  variant="bodyLarge"
                >
                  {user?.profile.name}
                </PaperText>
                <PaperText
                  variant="bodyLarge"
                  style={[styles.streak, { marginLeft: "auto" }]}
                >
                  {leaderboard.find((u) => u.id === user?.uid)?.streak || 0} days streak
                </PaperText>
              </Card>
            )}

            {leaderboard.slice(3, leaderboard.length).length > 0 && (
              <View
                style={[
                  styles.leaderBoardEntryContainer,
                  { backgroundColor: theme.colors.background },
                ]}
              >
                {leaderboard.slice(3, leaderboard.length).map((user, index) => {
                  if (!user?.name || user.streak === 0) return null; // Skip users with no streaks
                  return (
                    <View
                      key={user.id}
                      style={[
                        styles.leaderBoardEntry,
                        { borderBottomColor: theme.colors.secondary },
                      ]}
                    >
                      <PaperText
                        style={styles.rank}
                        variant="bodyLarge"
                      >
                        #{index + 4}
                      </PaperText>
                      <PaperText
                        style={styles.name}
                        variant="bodyLarge"
                      >
                        {user?.name || "User name"}
                      </PaperText>
                      <PaperText
                        style={[styles.streak, { marginLeft: "auto" }]}
                        variant="labelLarge"
                      >
                        {user.streak} days streak
                      </PaperText>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </>
      ) : (
        <View style={styles.emptyState}>
          <PaperText style={styles.emptyText}>No leaderboard data available yet.</PaperText>
          <PaperText style={styles.emptySubText}>
            Start building your streak to appear on the leaderboard!
          </PaperText>
          {userRank && (
            <Card
              style={[
                styles.fullWidthCard,
                { backgroundColor: theme.colors.secondary, marginTop: 20 },
              ]} // Updated to fullWidthCard
              contentStyle={styles.cardContent}
            >
              <PaperText
                style={styles.rank}
                variant="bodyLarge"
              >
                #{userRank.position}
              </PaperText>
              <PaperText
                style={styles.name}
                variant="bodyLarge"
              >
                {user?.profile.name}
              </PaperText>
              <PaperText
                variant="bodyLarge"
                style={[styles.streak, { marginLeft: "auto" }]}
              >
                {leaderboard.find((u) => u.id === user?.uid)?.streak || 0} days streak
              </PaperText>
            </Card>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 10,
  },
  leaderboardTop: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    marginBottom: 10,
    marginTop: 50,
    height: 150,
  },
  topPositionsContainer: {
    borderRadius: 10,
    marginVertical: 5,
    padding: 5,
    borderBottomEndRadius: 0,
    borderBottomStartRadius: 0,
    maxWidth: 150,
  },
  userSection: {
    marginBottom: 10,
  },
  fullWidthCard: {
    // New style for full-width card
    borderRadius: 10,
    marginVertical: 5,
    padding: 10,
    width: "100%", // Ensure full width
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  middleCard: {
    height: "100%",
    width: "35%",
    alignItems: "center",
    zIndex: 10,
  },
  sideCard: {
    height: "80%",
    width: "30%",
  },
  rank: {
    fontWeight: "bold",
  },
  name: {
    textAlign: "center",
  },
  streak: {
    textAlign: "center",
  },
  crown: {
    position: "absolute",
    top: -45,
    left: "5%",
    transform: [{ translateX: "-5%" }],
  },
  leaderBoardEntry: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 0.5,
    gap: 10,
    padding: 5,
  },
  leaderBoardEntryContainer: {
    padding: 10,
    borderRadius: 10,
    marginVertical: 10,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  emptySubText: {
    fontSize: 14,
    textAlign: "center",
  },
});

export default LeaderBoard;
