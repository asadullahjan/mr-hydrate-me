import { useAuth } from "@/components/Auth/AuthProvider";
import { useUserHistoryStore, DailyRecord } from "@/store/userHistoryStore";
import moment from "moment";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { View, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { Calendar } from "react-native-calendars";
import WaterIntakeChart from "@/components/SummaryChart";
import EntriesSection from "@/components/History/EntriesSection";
import ProgressSection from "@/components/History/ProgressSection";
import { DateData, MarkedDates } from "react-native-calendars/src/types";

/**
 * History screen component that displays a calendar, progress, entries, and a chart
 * for a user's water intake history, with a subtle inline loading indicator.
 */
const History = () => {
  // Theme and authentication hooks
  const { colors } = useTheme(); // Access theme colors for consistent styling
  const { user } = useAuth(); // Get the authenticated user
  const { history, loading, fetchHistory } = useUserHistoryStore(); // Fetch history data from Zustand store

  // State for managing selected month and date
  const [selectedMonth, setSelectedMonth] = useState(moment().format("MMMM YYYY")); // Current month in "MMMM YYYY" format
  const [selectedDate, setSelectedDate] = useState(moment().format("YYYY-MM-DD")); // Current date in "YYYY-MM-DD" format
  const [selectedDateData, setSelectedDateData] = useState<DailyRecord | null>(null); // Data for the selected date

  // Memoized month range for fetching history data
  const monthRange = useMemo(() => {
    const start = moment(selectedMonth, "MMMM YYYY").startOf("month").toDate();
    const end = moment(selectedMonth, "MMMM YYYY").endOf("month").toDate();
    return { start, end };
  }, [selectedMonth]);

  // Fetch history data when month changes or user is available
  useEffect(() => {
    if (user?.uid) {
      fetchHistory(user.uid, monthRange.start, monthRange.end);
    }
  }, [fetchHistory, user?.uid, monthRange.start, monthRange.end]);

  // Update selected date data when date or history changes
  useEffect(() => {
    const data = history[moment(selectedDate).format("YYYY-MM-DD")];
    setSelectedDateData(data || null);
  }, [selectedDate, history]);

  // Memoized calendar markings for performance
  const markedDates = useMemo(() => {
    const markings: MarkedDates = Object.entries(history).reduce(
      (acc, [date, record]) => ({
        ...acc,
        [date]: {
          marked: record.percentage >= 100, // Mark days with 100% completion
          dotColor: "#4CAF50", // Green dot for completed days
        },
      }),
      {}
    );
    // Highlight the selected date
    markings[selectedDate] = {
      selected: true,
      disableTouchEvent: true,
      selectedColor: colors.primary,
    };
    return markings;
  }, [history, selectedDate, colors.primary]);

  // Callback for handling day press on calendar
  const handleDayPress = useCallback((day: DateData) => {
    setSelectedDate(day.dateString);
  }, []);

  // Callback for handling month change on calendar
  const handleMonthChange = useCallback((month: DateData) => {
    setSelectedMonth(moment(month.dateString).format("MMMM YYYY"));
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Calendar for selecting dates */}
      <Calendar
        onDayPress={handleDayPress}
        onMonthChange={handleMonthChange}
        markedDates={markedDates}
        theme={{
          backgroundColor: colors.background,
          calendarBackground: colors.background,
        }}
        style={[styles.card, { backgroundColor: colors.background }]}
      />

      {/* Selected date with inline loading indicator */}
      <View style={styles.dateRow}>
        <Text
          variant="labelLarge"
          style={styles.date}
        >
          {selectedDate}
        </Text>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size={14}
              color={colors.primary}
              style={styles.loadingIndicator}
            />
            <Text variant="labelSmall">Updating</Text>
          </View>
        )}
      </View>

      {/* Progress section showing water intake completion */}
      <ProgressSection selectedDateData={selectedDateData} />

      {/* Entries section showing detailed intake logs */}
      <EntriesSection selectedDateData={selectedDateData} />

      {/* Chart visualizing monthly water intake */}
      <WaterIntakeChart
        userId={user?.uid!} // Non-null assertion since user is checked earlier
        data={history}
        loading={loading}
        viewMode="month"
      />
    </ScrollView>
  );
};

// Styles for the History component
const styles = StyleSheet.create({
  container: {
    flexGrow: 1, // Allows ScrollView to expand fully
    padding: 10,
    paddingVertical: 40,
  },
  card: {
    borderRadius: 10,
    padding: 10,
    overflow: "hidden",
    marginBottom: 10,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // Spreads date and indicator across the row
    marginBottom: 5,
  },
  date: {
    flexShrink: 1, // Prevents date text from pushing the indicator off-screen
  },
  loadingContainer: {
    flexDirection: "row",
    gap: 2,
  },
  loadingIndicator: {
    marginLeft: 8, // Small gap between date and spinner
  },
});

export default React.memo(History); // Memoize to prevent unnecessary re-renders
