import { db } from "@/firebaseConfig";
import { DailyRecord } from "@/store/userHistoryStore";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import moment from "moment";
import { Alert } from "react-native";

type Weather = { humidity: number, temperature: number }

export async function checkAndUpdateDailyWaterGoal(userId: string): Promise<DailyRecord> {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const dateKey = moment(today).format('YYYY-MM-DD');

  // Check if today's record exists
  const todayRecordRef = doc(db, `users/${userId}/dailyRecords/${today}`);
  let todayRecord = await getDoc(todayRecordRef);

  if (!todayRecord.exists()) {
    // Get user data
    const userRef = doc(db, `users/${userId}`);
    const user = await getDoc(userRef);
    const userData = user.data()
    const userProfile = userData?.profile
    const baseGoal = userProfile?.dailyGoal;

    // Get weather data for user's location (from a weather API)
    const weatherData = await fetchWeatherData(userData?.settings.location);
    const weatherAdjustment = calculateWeatherAdjustment(weatherData);

    // Create today's record
    await setDoc(todayRecordRef, {
      date: moment(dateKey).startOf('day').toDate(),
      baseGoal: baseGoal,
      weatherAdjustment: weatherAdjustment,
      totalAmount: baseGoal + weatherAdjustment,
      completedAmount: 0,
      percentage: 0,
      lastUpdated: serverTimestamp()
    });
    todayRecord = await getDoc(todayRecordRef);
  }

  console.log({ todayRecord })
  return todayRecord.data() as DailyRecord;
}


async function fetchWeatherData({ latitude, longitude }: { latitude: number, longitude: number }): Promise<Weather> {
  try {
    const url = `https://api.tomorrow.io/v4/weather/realtime?location=${latitude},${longitude}&apikey=${process.env.EXPO_PUBLIC_TOMORROW_IO_API_KEY}`;
    const options = {
      method: 'GET',
      headers: { accept: 'application/json', 'accept-encoding': 'deflate, gzip, br' }
    };

    const fetchedData = await fetch(url, options)
    const { data } = await fetchedData.json()

    return {
      humidity: data.values.humidity,
      temperature: data.values.temperature,
    }
  } catch (err) {
    console.error(err)
    return {
      humidity: 0,
      temperature: 0
    }
  }
}

function calculateWeatherAdjustment(weather: Weather): number {
  let adjustment = 0;

  // Temperature adjustment using a sliding scale (more precise than threshold-based)
  if (weather.temperature > 20) {
    // Progressive increase: 50ml per degree above 20°C
    adjustment += (weather.temperature - 20) * 50;
  } else if (weather.temperature < 10) {
    // Slight decrease for cold weather (people tend to drink less)
    adjustment -= (10 - weather.temperature) * 20;
  }

  // Humidity adjustment - more granular approach
  // Higher humidity reduces body's cooling efficiency through sweat
  if (weather.humidity > 50) {
    // 4ml per percentage point above 50% humidity
    adjustment += (weather.humidity - 50) * 4;
  }

  // Consider heat index (feels-like temperature) for extreme conditions
  if (weather.temperature > 28 && weather.humidity > 60) {
    // Additional adjustment for combined heat and humidity
    const heatStressFactor = (weather.temperature - 28) * (weather.humidity - 60) / 100;
    adjustment += heatStressFactor * 10;
  }

  // Cap the total adjustment to reasonable limits
  return Math.min(1500, Math.max(-500, Math.round(adjustment)));
}