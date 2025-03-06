import React, { useState, useEffect } from "react";
import { View, Dimensions, StyleSheet } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { useTheme } from "react-native-paper";
import moment from "moment";
import { LineChartData } from "react-native-chart-kit/dist/line-chart/LineChart";

// Define props interface
interface WaterIntakeChartProps {
  userId: string;
  data: any; // Consider typing this based on your data structure
  loading: boolean;
  viewMode?: "week" | "month"; // Determines label format
}

/**
 * WaterIntakeChart displays a line chart of water intake progress over a week or month.
 * @param userId - The ID of the user whose data is displayed
 * @param data - The water intake data to process and display
 * @param loading - Indicates if data is still loading
 * @param viewMode - "week" or "month" to adjust label format (default: "week")
 */
const WaterIntakeChart: React.FC<WaterIntakeChartProps> = ({
  userId,
  data,
  loading,
  viewMode = "week",
}) => {
  // State for chart data
  const [chartData, setChartData] = useState<LineChartData | null>(null);

  // Hooks for theme and window dimensions
  const { colors } = useTheme();
  const windowWidth = Dimensions.get("window").width;

  // Process data when it changes
  useEffect(() => {
    if (!loading && data) {
      const processedData = processDataForChart(data, viewMode);
      setChartData({
        labels: processedData.map((item) => item.x),
        datasets: [
          {
            data: processedData.map((item) => item.percentage),
            withDots: viewMode === "week",
          },
          { data: [0], withDots: false }, // Min Y-axis bound (hidden)
          { data: [100], withDots: false }, // Max Y-axis bound (hidden)
        ],
      });
    }
  }, [userId, data, loading, viewMode]);

  // Dynamic label styling based on view mode
  const getLabelStyle = () =>
    viewMode === "month" ? { fontSize: 8, rotation: 45 } : { fontSize: 10, rotation: 0 };

  const labelStyle = getLabelStyle();

  return (
    <View style={styles.container}>
      {chartData && chartData.labels.length > 0 && (
        <View style={[styles.chartWrapper, { backgroundColor: colors.background }]}>
          <LineChart
            data={chartData}
            width={windowWidth - 20}
            height={230}
            yAxisSuffix="%"
            yAxisLabel=""
            fromZero={true}
            withInnerLines={false}
            withOuterLines={false}
            segments={4}
            transparent={true}
            bezier
            style={styles.chartStyle}
            chartConfig={{
              decimalPlaces: 0,
              color: (opacity = 1) => colors.primary,
              labelColor: (opacity = 1) => colors.primary,
              style: {
                borderRadius: 16,
              },
              barPercentage: 0.8,
              strokeWidth: 1,
              propsForVerticalLabels: {
                fontSize: labelStyle.fontSize,
                rotation: labelStyle.rotation,
              },
            }}
          />
        </View>
      )}
    </View>
  );
};

/**
 * Processes raw data into a format suitable for the chart based on view mode.
 * @param data - Raw water intake data
 * @param viewMode - "week" or "month" to determine label format
 * @returns Array of processed data points with labels and percentages
 */
const processDataForChart = (data: any, viewMode: "week" | "month" = "week") => {
  const dataEntries = Object.entries(data)
    .map(([dateString, entry]: [string, any]) => ({
      originalDate: dateString,
      momentObj: moment(dateString),
      x: "", // Placeholder for label
      percentage: entry.percentage || 0,
    }))
    .sort((a, b) => a.momentObj.valueOf() - b.momentObj.valueOf());

  return dataEntries.map((entry) => ({
    ...entry,
    x: viewMode === "week" ? entry.momentObj.format("ddd") : entry.momentObj.format("D"),
    momentObj: undefined, // Remove moment object from final result
  }));
};

// Styles for the WaterIntakeChart component
const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    overflow: "visible",
  },
  chartWrapper: {
    padding: 20,
    borderRadius: 10,
    overflow: "visible",
  },
  chartStyle: {
    marginLeft: -40, // Adjust for label visibility
    marginBottom: -20, // Reduce bottom margin
  },
});

export default WaterIntakeChart;
