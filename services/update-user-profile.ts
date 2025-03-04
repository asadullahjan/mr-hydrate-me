// src/services/user/updateUserData.ts

import { db } from "@/firebaseConfig";
import { setDoc, doc } from "firebase/firestore";

// Define interfaces for type safety
interface UserProfile {
  weight?: number;      // in kg
  age?: number;         // in years
  height?: number;      // in cm
  activity?: ActivityLevel;
  dailyGoal?: number;   // in ml
  gender?: Gender;      // added gender for more accurate calculations
  [key: string]: any;   // allow other profile properties
}


interface UserData {
  profile?: UserProfile;
  generalData?: {
    [key: string]: any;
  };
}

type ActivityLevel = "sedentary" | "light" | "moderate" | "very" | "extreme";
type Gender = "male" | "female" | "other";

interface WaterIntakeParams {
  weight?: number;
  age?: number;
  height?: number;
  activity?: ActivityLevel;
  gender?: Gender;
  climate?: string;     // optional climate consideration
}

export const calculateDailyGoal = (params: WaterIntakeParams): number => {
  // Destructure with default values for null safety
  const {
    weight = 70,            // kg
    age = 30,               // years
    height = 170,           // cm
    activity = "light",
    gender = "other",
    climate = "moderate"
  } = params;

  // Base calculation using more nuanced approach
  // Research suggests 30-35ml/kg is appropriate for most adults
  let baseWaterIntake = weight * (age < 30 ? 35 : age > 60 ? 30 : 33);

  // Age adjustment with more granular scaling
  // Water needs generally decrease with age due to lower muscle mass
  const ageAdjustment = Math.max(-0.1, Math.min(0.1, (40 - age) / 200));

  // Gender adjustment (based on average body composition differences)
  const genderFactor = gender === "male" ? 0.05 : gender === "female" ? -0.03 : 0;

  // Height adjustment - taller people generally need more water per kg
  // Using a ratio based on deviation from average height (170cm)
  const heightFactor = ((height - 170) / 170) * 0.06;

  // Activity adjustment - more detailed factors
  const activityFactors: Record<ActivityLevel, number> = {
    sedentary: -0.1,     // -10% (minimal physical activity)
    light: 0,            // baseline
    moderate: 0.12,      // +12% (regular moderate exercise)
    very: 0.25,          // +25% (daily intense exercise)
    extreme: 0.4         // +40% (professional athlete level)
  };

  // Climate adjustment
  const climateFactor = climate === "hot" ? 0.1 :
    climate === "humid" ? 0.08 :
      climate === "dry" ? 0.05 :
        climate === "cold" ? -0.05 : 0;

  // Calculate total adjustment factor
  const adjustmentFactor = 1 + ageAdjustment + genderFactor + heightFactor +
    activityFactors[activity] + climateFactor;

  // Apply adjustment factor and round to nearest 50ml for practical use
  return Math.round((baseWaterIntake * adjustmentFactor) / 50) * 50;
};

export const updateUserData = async (userId: string, userData: UserData): Promise<number> => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  // Default empty objects to prevent null reference errors
  const profile = userData.profile || {};
  const generalData = userData.generalData || {};

  // Calculate daily water intake goal
  const dailyGoal = calculateDailyGoal({
    weight: profile.weight,
    age: profile.age,
    height: profile.height,
    activity: profile.activity,
    gender: profile.gender
  });

  try {
    const docRef = doc(db, `users/${userId}`);
    await setDoc(
      docRef,
      {
        profile: { ...profile, dailyGoal },
        ...generalData,
        lastUpdated: new Date(),
      },
      { merge: true }
    );

    return dailyGoal;
  } catch (error) {
    console.error("Error updating user data:", error);
    throw error;
  }
};