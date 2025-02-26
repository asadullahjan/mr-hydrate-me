import { db } from "@/firebaseConfig";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import moment from "moment";

export async function checkAndUpdateDailyWaterGoal(userId) {
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
    const weatherData = await fetchWeatherData(userProfile?.location || { lat: 0, lng: 0 });
    const weatherAdjustment = calculateWeatherAdjustment(weatherData);

    // Create today's record
    await setDoc(todayRecordRef, {
      date: moment(dateKey).startOf('day').toDate(),
      baseGoal: baseGoal,
      weatherAdjustment: weatherAdjustment,
      totalAmount: baseGoal + weatherAdjustment,
      completedAmount: 0,
      lastUpdated: serverTimestamp()
    });
    todayRecord = await getDoc(todayRecordRef);
  }

  console.log({ todayRecord })
  return todayRecord.data();
}


async function fetchWeatherData({ lat, lng }) {
  // Call a weather API (e.g., OpenWeatherMap)
  // Return temperature, humidity, etc.
  // This is a placeholder - implement actual API call
  return { temperature: 25, humidity: 60 };
}

function calculateWeatherAdjustment(weather) {
  // Logic to adjust water intake based on weather
  let adjustment = 0;

  // Example: Increase intake in hot weather
  if (weather.temperature > 30) {
    adjustment += 500; // Add 500ml for hot days
  } else if (weather.temperature > 25) {
    adjustment += 250; // Add 250ml for warm days
  }

  // Consider humidity
  if (weather.humidity > 70) {
    adjustment += 200; // Add 200ml for humid days
  }

  return adjustment;
}