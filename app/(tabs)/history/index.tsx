import { useAuth } from "@/components/auth/AuthProvider";
import { useUserHistoryStore, DailyRecord } from "@/store/userHistoryStore";
import moment from "moment";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { View, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { Calendar } from "react-native-calendars";
import WaterIntakeChart from "@/components/SummaryChart";
import EntriesSection from "@/components/history/EntriesSection";
import ProgressSection from "@/components/history/ProgressSection";
import { DateData, MarkedDates } from "react-native-calendars/src/types";

/**
 * History screen displays a user's water intake history with a calendar,
 * progress details, daily entries, and a monthly chart. Includes subtle loading feedback.
 */
const History = () => {
  // Theme and authentication hooks
  const { colors } = useTheme(); // Access theme colors for styling
  const { user } = useAuth(); // Get authenticated user
  const { history, loading, fetchHistory } = useUserHistoryStore(); // Manage history data via Zustand store

  // State for selected month and date
  const [selectedMonth, setSelectedMonth] = useState(moment().format("MMMM YYYY")); // e.g., "March 2025"
  const [selectedDate, setSelectedDate] = useState(moment().format("YYYY-MM-DD")); // e.g., "2025-03-06"
  const [selectedDateData, setSelectedDateData] = useState<DailyRecord | null>(null); // Data for selected date

  // Memoized month range for fetching history data
  const monthRange = useMemo(() => {
    const start = moment(selectedMonth, "MMMM YYYY").startOf("month").toDate();
    const end = moment(selectedMonth, "MMMM YYYY").endOf("month").toDate();
    return { start, end };
  }, [selectedMonth]);

  // Fetch history data when user or month changes
  useEffect(() => {
    if (user?.uid) {
      fetchHistory(user.uid, monthRange.start, monthRange.end);
    }
  }, [fetchHistory, user?.uid, monthRange.start, monthRange.end]);

  // Update selected date's data when date or history changes
  useEffect(() => {
    const data = history[moment(selectedDate).format("YYYY-MM-DD")];
    setSelectedDateData(data || null);
  }, [selectedDate, history]);

  // Memoized calendar markings to optimize performance
  const markedDates = useMemo(() => {
    const markings: MarkedDates = Object.entries(history).reduce(
      (acc, [date, record]) => ({
        ...acc,
        [date]: {
          marked: record.percentage >= 100, // Mark days with 100%+ completion
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
      ...(markings[selectedDate] || {}), // Merge with existing markings if any
    };
    return markings;
  }, [history, selectedDate, colors.primary]);

  // Handle day selection on calendar
  const handleDayPress = useCallback((day: DateData) => {
    setSelectedDate(day.dateString);
  }, []);

  // Handle month change on calendar
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
          {moment(selectedDate).format("MMMM D, YYYY")} {/* e.g., "March 6, 2025" */}
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

      {/* Progress section for water intake completion */}
      <ProgressSection selectedDateData={selectedDateData} />

      {/* Entries section for detailed intake logs */}
      <EntriesSection selectedDateData={selectedDateData} />

      {/* Monthly water intake chart */}
      <WaterIntakeChart
        userId={user?.uid ?? ""} // Fallback to empty string if user is null
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
    flexGrow: 1, // Ensures ScrollView content expands fully
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
    justifyContent: "space-between",
    marginBottom: 5,
  },
  date: {
    flexShrink: 1, // Prevents text overflow
  },
  loadingContainer: {
    flexDirection: "row",
    gap: 2,
  },
  loadingIndicator: {
    marginLeft: 8, // Space between date and spinner
  },
});

export default React.memo(History); // Memoize to prevent unnecessary re-renders
