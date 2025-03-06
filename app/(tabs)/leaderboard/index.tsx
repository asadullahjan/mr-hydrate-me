import { useAuth } from "@/components/Auth/AuthProvider";
import { useLeaderboardStore } from "@/store/leaderboardStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Card, Text as PaperText, ActivityIndicator, useTheme } from "react-native-paper";

/**
 * LeaderBoard screen displays a ranking of users based on their streaks,
 * highlighting the top 3 and the current user's position.
 */
const LeaderBoard = () => {
  // Hooks for leaderboard data, authentication, and theme
  const { leaderboard, userRank, loading, fetchLeaderboard } = useLeaderboardStore();
  const { user } = useAuth();
  const { colors } = useTheme();

  // Fetch leaderboard data when user changes
  useEffect(() => {
    if (user?.uid) {
      fetchLeaderboard(user.uid);
    }
  }, [fetchLeaderboard, user?.uid]);

  // Show loading indicator while data is being fetched
  if (loading) {
    return <ActivityIndicator style={styles.loading} />;
  }

  // Check if there's meaningful leaderboard data (excluding empty streaks)
  const hasLeaderboardData =
    leaderboard.length > 1 || // More than just the current user
    (leaderboard.length === 1 && leaderboard[0].streak > 0); // Current user has a streak

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <PaperText
        variant="headlineMedium"
        style={styles.header}
      >
        Leaderboard
      </PaperText>

      {hasLeaderboardData ? (
        <>
          {/* Top 3 Positions */}
          <View style={styles.leaderboardTop}>
            {[leaderboard[1], leaderboard[0], leaderboard[2]].map((user, index) => {
              if (!user || !user.name || user.streak === 0) return null; // Skip invalid or zero-streak users
              return (
                <Card
                  key={user.id}
                  style={[
                    styles.topPositionsContainer,
                    index === 1
                      ? { ...styles.middleCard, backgroundColor: colors.primary }
                      : { ...styles.sideCard, backgroundColor: colors.secondary },
                    index === 0 && { borderTopEndRadius: 0 },
                    index === 2 && { borderTopStartRadius: 0 },
                  ]}
                >
                  <PaperText
                    variant="titleMedium"
                    style={styles.name}
                  >
                    {user.name || "User"}
                  </PaperText>
                  <PaperText style={styles.streak}>{user.streak} days</PaperText>
                  {index === 1 && (
                    <MaterialCommunityIcons
                      size={35}
                      name="crown"
                      style={styles.crown}
                      color="gold"
                    />
                  )}
                </Card>
              );
            })}
          </View>

          {/* User Rank and Remaining Leaderboard */}
          <View style={styles.userSection}>
            {userRank && (
              <Card
                style={[styles.fullWidthCard, { backgroundColor: colors.secondary }]}
                contentStyle={styles.cardContent}
              >
                <PaperText
                  variant="bodyLarge"
                  style={styles.rank}
                >
                  #{userRank.position}
                </PaperText>
                <PaperText
                  variant="bodyLarge"
                  style={styles.name}
                >
                  {user?.profile.name || "You"}
                </PaperText>
                <PaperText
                  variant="bodyLarge"
                  style={[styles.streak, { marginLeft: "auto" }]}
                >
                  {leaderboard.find((u) => u.id === user?.uid)?.streak || 0} days
                </PaperText>
              </Card>
            )}

            {leaderboard.slice(3).length > 0 && (
              <View
                style={[styles.leaderboardEntryContainer, { backgroundColor: colors.background }]}
              >
                {leaderboard.slice(3).map((user, index) => {
                  if (!user?.name || user.streak === 0) return null; // Skip invalid or zero-streak users
                  return (
                    <View
                      key={user.id}
                      style={[styles.leaderboardEntry, { borderBottomColor: colors.secondary }]}
                    >
                      <PaperText
                        variant="bodyLarge"
                        style={styles.rank}
                      >
                        #{index + 4}
                      </PaperText>
                      <PaperText
                        variant="bodyLarge"
                        style={styles.name}
                      >
                        {user.name || "User"}
                      </PaperText>
                      <PaperText
                        variant="labelLarge"
                        style={[styles.streak, { marginLeft: "auto" }]}
                      >
                        {user.streak} days
                      </PaperText>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </>
      ) : (
        /* Empty State */
        <View style={styles.emptyState}>
          <PaperText
            variant="titleLarge"
            style={styles.emptyText}
          >
            No leaderboard data available yet.
          </PaperText>
          <PaperText
            variant="bodyMedium"
            style={styles.emptySubText}
          >
            Start building your streak to appear on the leaderboard!
          </PaperText>
          {userRank && (
            <Card
              style={[styles.fullWidthCard, { backgroundColor: colors.secondary, marginTop: 20 }]}
              contentStyle={styles.cardContent}
            >
              <PaperText
                variant="bodyLarge"
                style={styles.rank}
              >
                #{userRank.position}
              </PaperText>
              <PaperText
                variant="bodyLarge"
                style={styles.name}
              >
                {user?.profile.name || "You"}
              </PaperText>
              <PaperText
                variant="bodyLarge"
                style={[styles.streak, { marginLeft: "auto" }]}
              >
                {leaderboard.find((u) => u.id === user?.uid)?.streak || 0} days
              </PaperText>
            </Card>
          )}
        </View>
      )}
    </ScrollView>
  );
};

// Styles for the LeaderBoard component
const styles = StyleSheet.create({
  container: {
    padding: 10,
    paddingBottom: 20,
  },
  header: {
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
  userSection: {
    marginBottom: 10,
  },
  fullWidthCard: {
    borderRadius: 10,
    marginVertical: 5,
    padding: 10,
    width: "100%",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
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
  leaderboardEntryContainer: {
    padding: 10,
    borderRadius: 10,
    marginVertical: 10,
  },
  leaderboardEntry: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 0.5,
    gap: 10,
    padding: 5,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  emptySubText: {
    textAlign: "center",
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default LeaderBoard;
