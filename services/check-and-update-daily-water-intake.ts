import { db } from "@/firebaseConfig";
import { DailyRecord } from "@/store/userHistoryStore";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import moment from "moment";
import * as Location from "expo-location";
import Constants from "expo-constants";

// Define weather data interface
interface Weather {
  humidity: number;
  temperature: number;
}

/**
 * Checks and updates the user's daily water goal based on weather conditions if no record exists for today.
 * @param userId - The ID of the user
 * @param location - The user's current location coordinates (optional)
 * @returns The DailyRecord for today
 * @throws Error if Firestore operations fail
 */
export async function checkAndUpdateDailyWaterGoal(
  userId: string,
  location: Location.LocationObjectCoords | null
): Promise<DailyRecord> {
  const today = moment().format("YYYY-MM-DD");
  const dayRef = doc(db, `users/${userId}/dailyRecords/${today}`);

  // Check if today's record exists
  const daySnap = await getDoc(dayRef);
  if (daySnap.exists()) {
    return daySnap.data() as DailyRecord;
  }

  // Fetch user data if no record exists
  const userRef = doc(db, `users/${userId}`);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) {
    throw new Error("User data not found");
  }

  const userData = userSnap.data();
  const baseGoal = userData?.profile?.dailyGoal ?? 2000; // Default to 2000ml if not set

  // Get weather data and calculate adjustment
  const weatherData = await fetchWeatherData(
    location ?? userData?.settings?.location ?? { latitude: 0, longitude: 0 }
  );
  const weatherAdjustment = calculateWeatherAdjustment(weatherData);

  // Create today's record
  const newRecord = {
    date: moment(today).startOf("day").toDate(),
    baseGoal,
    weatherAdjustment,
    totalAmount: baseGoal + weatherAdjustment,
    completedAmount: 0,
    percentage: 0,
    lastUpdated: serverTimestamp(),
  };

  await setDoc(dayRef, newRecord);
  const updatedSnap = await getDoc(dayRef);

  return updatedSnap.data() as DailyRecord;
}

/**
 * Fetches real-time weather data for a given location using the Tomorrow.io API.
 * @param location - The latitude and longitude coordinates
 * @returns Weather data with humidity and temperature
 */
async function fetchWeatherData({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}): Promise<Weather> {
  try {
    const apiKey = Constants.expoConfig?.extra?.EXPO_PUBLIC_TOMORROW_IO_API_KEY;
    if (!apiKey) {
      throw new Error("Weather API key is missing");
    }

    const url = `https://api.tomorrow.io/v4/weather/realtime?location=${latitude},${longitude}&apikey=${apiKey}`;
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        "accept-encoding": "deflate, gzip, br",
      },
    };

    const response = await fetch(url, options);
    const { data } = await response.json();

    return {
      humidity: data.values.humidity,
      temperature: data.values.temperature,
    };
  } catch (err) {
    console.error("Failed to fetch weather data:", err);
    return { humidity: 0, temperature: 0 }; // Fallback values
  }
}

/**
 * Calculates a water goal adjustment based on weather conditions.
 * @param weather - The weather data with humidity and temperature
 * @returns The adjustment amount in ml, capped between -500 and 1500
 */
function calculateWeatherAdjustment(weather: Weather): number {
  let adjustment = 0;

  // Temperature adjustment (sliding scale)
  if (weather.temperature > 20) {
    adjustment += (weather.temperature - 20) * 50; // +50ml per °C above 20°C
  } else if (weather.temperature < 10) {
    adjustment -= (10 - weather.temperature) * 20; // -20ml per °C below 10°C
  }

  // Humidity adjustment
  if (weather.humidity > 50) {
    adjustment += (weather.humidity - 50) * 4; // +4ml per % above 50%
  }

  // Heat index adjustment for extreme conditions
  if (weather.temperature > 28 && weather.humidity > 60) {
    const heatStressFactor = (weather.temperature - 28) * (weather.humidity - 60) / 100;
    adjustment += heatStressFactor * 10;
  }

  // Cap adjustment between -500ml and 1500ml
  return Math.min(1500, Math.max(-500, Math.round(adjustment)));
}