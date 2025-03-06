import { db } from "@/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { ScrollView, View, Dimensions } from "react-native";
import moment from "moment";
import React, { useState, useEffect } from "react";
import ArcProgress from "./ArcProgress";
import { BarChart, LineChart } from "react-native-chart-kit";
import { getWeekMonthData } from "@/services/get-week-month-progress";
import { useTheme } from "react-native-paper";
import { LineChartData } from "react-native-chart-kit/dist/line-chart/LineChart";

const WaterIntakeChart = ({
  userId,
  data,
  loading,
  viewMode = "week", // Add viewMode prop to determine label format
}: {
  userId: string;
  data: any;
  loading: boolean;
  viewMode?: "week" | "month";
}) => {
  const [Data, setData] = useState<LineChartData | null>(null);
  const theme = useTheme();
  const windowWidth = Dimensions.get("window").width;

  useEffect(() => {
    if (!loading && data) {
      const processedData = processDataForChart(data, viewMode);

      // Format data for the chart
      setData({
        labels: processedData.map((item) => item.x),
        datasets: [
          {
            data: processedData.map((item) => item.percentage),
            withDots: viewMode === "week",
          },
          {
            data: [0], //min y with no dots to make it hidden
            withDots: false,
          },
          {
            data: [100], //max y with no dots to make it hidden
            withDots: false,
          },
        ],
      });
    }
  }, [userId, data, viewMode]);

  useEffect(() => {
    console.log({ Data: Data?.datasets[0].data });
  }, [Data]);

  // Dynamically determine label size and skipping based on view mode
  const getLabelStyle = () => {
    switch (viewMode) {
      case "month":
        return {
          fontSize: 8,
          rotation: 45,
        };
      case "week":
        return {
          fontSize: 10,
          rotation: 0,
        };
      default:
        return {
          fontSize: 10,
          rotation: 0,
        };
    }
  };

  const labelStyle = getLabelStyle();

  return (
    <View style={{ alignItems: "center", overflow: "visible" }}>
      {Data && Data.labels.length > 0 && (
        <View
          style={{
            padding: 20,
            backgroundColor: theme.colors.background,
            borderRadius: 10,
            overflow: "visible",
          }}
        >
          <LineChart
            data={Data}
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
            style={{
              marginLeft: -40, // Reduce left margin
              marginBottom: -20, // Reduce bottom margin
            }}
            chartConfig={{
              decimalPlaces: 0,
              color: (opacity = 1) => theme.colors.primary,
              labelColor: (opacity = 1) => theme.colors.primary,
              style: {
                borderRadius: 16,
                borderWidth: 2,
                borderColor: "black",
              },
              barPercentage: 0.8,
              strokeWidth: 1,
              // Define step size for Y-axis
              count: 5,
              // Compact Y-axis labels
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

export default WaterIntakeChart;

// Improved process for chart with smart labeling based on view mode
const processDataForChart = (Data: any, viewMode = "week") => {
  const dataEntries = Object.entries(Data)
    .map(([dateString, data]) => {
      const momentDate = moment(dateString);
      return {
        originalDate: dateString,
        momentObj: momentDate,
        // Will be replaced with appropriate format based on viewMode
        x: "",
        y: data.totalAmount,
        percentage: data.percentage || 0,
      };
    })
    .sort((a, b) => a.momentObj.valueOf() - b.momentObj.valueOf());

  // Apply appropriate labeling strategy based on viewMode
  return dataEntries.map((entry, index, array) => {
    const { momentObj } = entry;
    let xLabel = "";

    switch (viewMode) {
      case "week":
        // For week view, show day abbreviations
        xLabel = momentObj.format("ddd");
        break;

      case "month":
        xLabel = momentObj.format("D");
        break;

      default:
        xLabel = momentObj.format("D");
    }

    return {
      ...entry,
      x: xLabel,
      momentObj: undefined, // Remove moment object from final result
    };
  });
};
