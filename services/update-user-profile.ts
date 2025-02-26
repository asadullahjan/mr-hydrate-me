// src/services/user/updateUserData.js

import { db } from "@/firebaseConfig";
import { setDoc, doc } from "firebase/firestore";


export const calculateDailyGoal = ({ weight, age, height, activity }) => {
  // Default values if missing
  const w = weight || 70; // kg
  const a = age || 30; // years
  const h = height || 170; // cm
  const act = activity || "light";

  // Base: 35ml per kg
  let baseWaterIntake = w * 35;

  // Age adjustment
  let ageFactor = 0;
  if (a < 30) ageFactor = 0.05; // +5%
  else if (a > 60) ageFactor = -0.05; // -5%

  // Height adjustment
  const heightAdjustment = (h / 170) * baseWaterIntake * 0.05;

  // Activity adjustment
  const activityFactors = {
    sedentary: -0.1,
    light: 0,
    moderate: 0.1,
    very: 0.2,
    extreme: 0.3,
  };
  const activityFactor = activityFactors[act] || 0;

  // Final calculation
  return Math.round(baseWaterIntake * (1 + ageFactor + activityFactor) + heightAdjustment);
};

export const updateUserData = async (userId, userData: { profile?: any, settings?: any, generalData?: any }) => {
  const { weight, age, height, activity } = userData.profile;
  const dailyGoal = calculateDailyGoal({ weight, age, height, activity });

  const docRef = doc(db, `users/${userId}`);
  await setDoc(
    docRef,
    {
      profile: { ...userData.profile, dailyGoal },
      settings: { ...userData.settings },
      ...userData.generalData,
      lastUpdated: new Date(),
    },
    { merge: true }
  );

  return dailyGoal;
};