import { db } from "@/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";

// Define interfaces for type safety
interface UserProfile {
  weight?: number; // in kg
  age?: number; // in years
  height?: number; // in cm
  activity?: ActivityLevel;
  dailyGoal?: number; // in ml
  gender?: Gender;
  [key: string]: any; // Allow additional properties
}

interface UserData {
  profile?: UserProfile;
  generalData?: Record<string, any>;
}

type ActivityLevel = "sedentary" | "light" | "moderate" | "very" | "extreme";
type Gender = "male" | "female" | "other";

interface WaterIntakeParams {
  weight?: number; // in kg
  age?: number; // in years
  height?: number; // in cm
  activity?: ActivityLevel;
  gender?: Gender;
  climate?: string; // Optional climate consideration
}

/**
 * Calculates the daily water intake goal based on user parameters.
 * @param params - User parameters for water intake calculation
 * @returns The calculated daily water goal in ml, rounded to the nearest 50ml
 */
export const calculateDailyGoal = (params: WaterIntakeParams): number => {
  const {
    weight = 70, // Default: 70kg
    age = 30, // Default: 30 years
    height = 170, // Default: 170cm
    activity = "light",
    gender = "other",
    climate = "moderate",
  } = params;

  // Base water intake: 30-35ml/kg adjusted by age
  const baseWaterIntake = weight * (age < 30 ? 35 : age > 60 ? 30 : 33);

  // Age adjustment: -0.1 to +0.1 based on deviation from 40 years
  const ageAdjustment = Math.max(-0.1, Math.min(0.1, (40 - age) / 200));

  // Gender adjustment: slight variation due to body composition
  const genderFactor = gender === "male" ? 0.05 : gender === "female" ? -0.03 : 0;

  // Height adjustment: proportional to deviation from 170cm
  const heightFactor = ((height - 170) / 170) * 0.06;

  // Activity adjustment: predefined factors
  const activityFactors: Record<ActivityLevel, number> = {
    sedentary: -0.1, // -10%
    light: 0, // Baseline
    moderate: 0.12, // +12%
    very: 0.25, // +25%
    extreme: 0.4, // +40%
  };

  // Climate adjustment: based on environmental conditions
  const climateFactor =
    climate === "hot"
      ? 0.1
      : climate === "humid"
        ? 0.08
        : climate === "dry"
          ? 0.05
          : climate === "cold"
            ? -0.05
            : 0;

  // Calculate total adjustment factor
  const adjustmentFactor =
    1 + ageAdjustment + genderFactor + heightFactor + activityFactors[activity] + climateFactor;

  // Apply adjustment and round to nearest 50ml
  return Math.round((baseWaterIntake * adjustmentFactor) / 50) * 50;
};

/**
 * Updates user data in Firestore, including a calculated daily water goal.
 * @param userId - The ID of the user to update
 * @param userData - Partial user data to update
 * @returns The calculated daily water goal in ml
 * @throws Error if userId is missing or Firestore operation fails
 */
export const updateUserData = async (userId: string, userData: UserData): Promise<number> => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const profile = userData.profile || {};
  const generalData = userData.generalData || {};

  // Calculate daily water goal based on profile data
  const dailyGoal = calculateDailyGoal({
    weight: profile.weight,
    age: profile.age,
    height: profile.height,
    activity: profile.activity,
    gender: profile.gender,
  });

  const userRef = doc(db, `users/${userId}`);
  await setDoc(
    userRef,
    {
      profile: { ...profile, dailyGoal },
      ...generalData,
      lastUpdated: new Date(),
    },
    { merge: true }
  );

  return dailyGoal;
};