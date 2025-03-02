import { useAuth } from "@/components/Auth/AuthProvider";
import { useLeaderboardStore } from "@/store/leaderboardStore";
import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Card, Text, Button, Avatar, ActivityIndicator, useTheme } from "react-native-paper";

const History = () => {
  const { leaderboard, userRank, loading, fetchLeaderboard } = useLeaderboardStore();
  const { user } = useAuth();
  const theme = useTheme();
  useEffect(() => {
    fetchLeaderboard(user?.uid!);
  }, [fetchLeaderboard, user]);

  if (loading) {
    return <ActivityIndicator style={{ margin: "auto" }} />;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>LeaderBoard</Text>
      <View style={styles.leaderboardTop}>
        {[leaderboard[1], leaderboard[0], leaderboard[2]].map((user, index) => {
          if (!user || !user.name) return;
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
              <Text
                style={styles.name}
                variant="titleMedium"
              >
                {user.name || "User"}
              </Text>
              <Text style={[styles.streak]}>{user.streak} days</Text>
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
            style={[styles.card, { backgroundColor: theme.colors.secondary }]}
            contentStyle={styles.cardContent}
          >
            <Text
              style={styles.rank}
              variant="bodyLarge"
            >
              #{userRank.position}
            </Text>
            <Text
              style={styles.name}
              variant="bodyLarge"
            >
              {user?.profile.name}
            </Text>
            <Text
              variant="bodyLarge"
              style={[styles.streak, { marginLeft: "auto" }]}
            >
              {leaderboard.find((u) => u.id === "currentUserId")?.streak || 0} days streak
            </Text>
          </Card>
        )}
        {leaderboard.slice(3, leaderboard.length).length > 0 && (
          <View
            style={[styles.leaderBoardEntryContainer, { backgroundColor: theme.colors.background }]}
          >
            {leaderboard.slice(3, leaderboard.length).map((user, index) => {
              return (
                <View
                  style={[styles.leaderBoardEntry, { borderBottomColor: theme.colors.secondary }]}
                >
                  <Text
                    style={styles.rank}
                    variant="bodyLarge"
                  >
                    #{index + 4}
                  </Text>
                  <Text
                    style={styles.name}
                    variant="bodyLarge"
                  >
                    {user?.name || "User name"}
                  </Text>
                  <Text
                    style={[styles.streak, { marginLeft: "auto" }]}
                    variant="labelLarge"
                  >
                    {leaderboard.find((u) => u.id === "currentUserId")?.streak || 0} days streak
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </View>
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
  card: {
    borderRadius: 10,
    marginVertical: 5,
    padding: 10,
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
});

export default History;
