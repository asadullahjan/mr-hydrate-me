import { db } from "@/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { ScrollView, View, Dimensions } from "react-native";
import moment from "moment";
import React, { useState, useEffect } from "react";
import ArcProgress from "./ArcProgress";
import { BarChart } from "react-native-chart-kit";
import { getWeekMonthData } from "@/services/get-week-month-progress";

const WaterIntakeChart = ({
  userId,
  duration = "week",
}: {
  userId: string;
  duration: "month" | "week";
}) => {
  const [Data, setData] = useState({
    labels: [],
    datasets: [{ data: [] }],
  });
  const [loading, setLoading] = useState(true);

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
          ],
        });
      } catch (error) {
        console.error("Error fetching water intake data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  useEffect(() => {
    console.log({ Data: Data.datasets[0].data });
  }, [Data]);

  return (
    <ScrollView>
      <View style={{ alignItems: "center", padding: 20 }}>
        {!loading && Data.labels.length > 0 && (
          <View style={{ marginTop: 20 }}>
            <BarChart
              data={Data}
              width={Dimensions.get("window").width - 40}
              height={220}
              yAxisSuffix="%"
              yAxisLabel=""
              chartConfig={{
                backgroundColor: "#ffffff",
                backgroundGradientFrom: "#ffffff",
                backgroundGradientTo: "#ffffff",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                barPercentage: 0.8,
              }}
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
            />
          </View>
        )}
      </View>
    </ScrollView>
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
