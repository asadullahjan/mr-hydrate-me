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
  duration = "week",
  refresh,
}: {
  userId: string;
  duration: "month" | "week";
  refresh: number;
}) => {
  const [Data, setData] = useState<LineChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const rawData = await getWeekMonthData({ userId, duration });
        console.log({ rawData });

        const processedData = processDataForChart(rawData);

        // Format data for the chart
        setData({
          labels: processedData.map((item) => item.x),
          datasets: [
            {
              data: processedData.map((item) => item.percentage),
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
      } catch (error) {
        console.error("Error fetching water intake data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, refresh]);

  return (
    <View style={{ alignItems: "center", overflow: "visible" }}>
      {Data && Data.labels.length > 0 && (
        <View
          style={{
            marginTop: 20,
            padding: 20,
            backgroundColor: theme.colors.background,
            borderRadius: 10,
            overflow: "visible",
          }}
        >
          <LineChart
            data={Data}
            width={Dimensions.get("window").width - 30}
            height={230}
            yAxisSuffix="%"
            yAxisLabel=""
            fromZero={true}
            withInnerLines={false}
            segments={4}
            transparent={true}
            bezier
            style={{
              marginLeft: -40, // Reduce left margin
              marginBottom: -20, // Reduce left margin
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
              propsForLabels: {
                fontSize: 10,
              },
            }}
          />
        </View>
      )}
    </View>
  );
};

export default WaterIntakeChart;

// Process for chart
const processDataForChart = (Data) => {
  return Object.entries(Data)
    .map(([date, data]) => ({
      x: moment(date).format("ddd"), // e.g., "Mon", "Tue"
      y: data.totalAmount, // Show total amount in chart
      percentage: data.percentage || 0, // Use precomputed percentage
    }))
    .sort((a, b) => moment(a.x, "ddd").day() - moment(b.x, "ddd").day());
};
