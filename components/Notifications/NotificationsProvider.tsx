import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import * as Notifications from "expo-notifications";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { useAuth } from "@/components/auth/AuthProvider";

// Define the shape of notification settings
export interface NotificationSettings {
  enabled: boolean;
  reminderFrequency: number;
  startTime: number;
  endTime: number;
  soundEnabled: boolean;
}

// Define the NotificationsState interface
interface NotificationsState {
  notificationPermission: string | null;
  settings: NotificationSettings;
  error: string | null;
  requestPermission: () => Promise<boolean>;
  updateSettings: (newSettings: Partial<NotificationSettings>) => Promise<void>;
}

// Create the NotificationsContext
const NotificationsContext = createContext<NotificationsState | undefined>(undefined);

// Default notification settings
const defaultSettings: NotificationSettings = {
  enabled: true,
  reminderFrequency: 4,
  startTime: 8, // 8 AM
  endTime: 20, // 8 PM
  soundEnabled: true,
};

/**
 * Schedules notifications based on the provided settings.
 * @param settings - The notification settings to apply
 */
async function scheduleNotifications(settings: NotificationSettings) {
  await Notifications.cancelAllScheduledNotificationsAsync(); // Clear existing notifications

  if (!settings.enabled) return;

  const { reminderFrequency, startTime, endTime, soundEnabled } = settings;
  const timeRangeHours = endTime - startTime; // Total hours in the range
  const intervalSeconds = Math.round((timeRangeHours * 60 * 60) / reminderFrequency); // Convert to seconds

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Time to Hydrate!",
      body: "Drink some water to stay on track.",
      sound: soundEnabled ? "default" : false,
    },
    trigger: {
      type: "timeInterval",
      seconds: intervalSeconds,
      repeats: true,
    } as Notifications.TimeIntervalTriggerInput,
  });
}

/**
 * NotificationsProvider manages notification permissions and settings, syncing with Firestore.
 * @param children - The child components to render within the provider
 */
export function NotificationsProvider({ children }: { children: ReactNode }) {
  // State for notification permissions and settings
  const [notificationPermission, setNotificationPermission] = useState<string | null>(null);
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [error, setError] = useState<string | null>(null);

  // Hook for auth user data
  const { user } = useAuth();

  /**
   * Requests notification permissions and updates state.
   * @returns True if permission is granted, false otherwise
   */
  const requestPermission = async (): Promise<boolean> => {
    try {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowSound: true,
          allowBadge: true,
        },
      });
      setNotificationPermission(status);

      if (status !== "granted") {
        setError("Notification permissions denied");
        return false;
      }
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error requesting notification permissions";
      setError(errorMessage);
      console.error("Permission request error:", err);
      return false;
    }
  };

  // Initialize notifications on mount or user change
  useEffect(() => {
    const initializeNotifications = async () => {
      // Load initial settings from user data or use defaults
      const initialSettings: NotificationSettings = user?.settings?.notifications
        ? {
            enabled: user.settings.notifications.enabled ?? defaultSettings.enabled,
            reminderFrequency:
              user.settings.notifications.reminderFrequency ?? defaultSettings.reminderFrequency,
            startTime: user.settings.notifications.startTime ?? defaultSettings.startTime,
            endTime: user.settings.notifications.endTime ?? defaultSettings.endTime,
            soundEnabled: user.settings.notifications.soundEnabled ?? defaultSettings.soundEnabled,
          }
        : defaultSettings;

      setSettings(initialSettings);

      // Request permissions and schedule notifications if enabled
      const permissionGranted = await requestPermission();
      if (permissionGranted && initialSettings.enabled) {
        await scheduleNotifications(initialSettings);
      }
    };

    initializeNotifications();
  }, [user]);

  /**
   * Updates notification settings, persists to Firestore, and reschedules notifications.
   * @param newSettings - Partial settings to update
   */
  const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);

      if (!user?.uid) throw new Error("No user ID available");

      const docRef = doc(db, "users", user.uid);
      await setDoc(
        docRef,
        {
          settings: { notifications: updatedSettings },
          lastUpdated: new Date(),
        },
        { merge: true }
      );

      if (updatedSettings.enabled && notificationPermission === "granted") {
        await scheduleNotifications(updatedSettings);
      } else {
        await Notifications.cancelAllScheduledNotificationsAsync();
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update notification settings";
      setError(errorMessage);
      console.error("Update settings error:", err);
    }
  };

  // Context value
  const value: NotificationsState = {
    notificationPermission,
    settings,
    error,
    requestPermission,
    updateSettings,
  };

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

/**
 * Hook to access the notifications context.
 * @returns The current notifications context value
 * @throws Error if used outside NotificationsProvider
 */
export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationsProvider");
  }
  return context;
}
