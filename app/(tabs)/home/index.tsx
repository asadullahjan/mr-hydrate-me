import { useAuth } from "@/components/Auth/AuthProvider";
import { FontAwesome } from "@expo/vector-icons";
import { View, StyleSheet, ScrollView } from "react-native";
import { Button, Surface, Text, useTheme } from "react-native-paper";
import { ArcProgress } from "@/components/ArcProgress";
import WaterIntakeChart from "@/components/SummaryChart";
import { AddDrinkModal } from "@/components/AddDrinkModal";

const Home = () => {
  const { user } = useAuth();
  const theme = useTheme();

  return (
    <ScrollView>
      <View style={styles.container}>
        <View style={styles.headingContainer}>
          <Text
            variant="headlineLarge"
            style={styles.heading}
          >
            Hello {user?.name}
          </Text>
          <FontAwesome
            name="user"
            size={30}
            color={"black"}
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
            2 days
          </Text>
          <Text
            variant="bodyLarge"
            style={styles.leaderBoardContainer}
          >
            <FontAwesome
              name="trophy"
              size={14}
            />{" "}
            6th
          </Text>
          <ArcProgress progress={50} />
          <AddDrinkModal
            trigger={
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
            }
          />
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
            duration="week"
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
  },
});
