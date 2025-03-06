import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import * as Notifications from "expo-notifications";
import { useAuth } from "@/components/Auth/AuthProvider";
import { db } from "@/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";

// Define the shape of notification settings
export interface NotificationSettings {
  enabled: boolean;
  reminderFrequency: number;
  startTime: number;
  endTime: number;
  soundEnabled: boolean;
}

interface NotificationsState {
  notificationPermission: string | null;
  settings: NotificationSettings;
  error: string | null;
  requestPermission: () => Promise<boolean>;
  updateSettings: (newSettings: Partial<NotificationSettings>) => Promise<void>;
}

const NotificationsContext = createContext<NotificationsState | undefined>(undefined);

// Default settings
const defaultSettings: NotificationSettings = {
  enabled: true,
  reminderFrequency: 4,
  startTime: 8, // 8 AM
  endTime: 20, // 8 PM
  soundEnabled: true,
};

// Schedule notifications based on settings
async function scheduleNotifications(settings: NotificationSettings) {
  await Notifications.cancelAllScheduledNotificationsAsync(); // Clear existing

  if (!settings.enabled) return;
  console.log({ settings });
  const { reminderFrequency, startTime, endTime, soundEnabled } = settings;
  const timeRangeHours = endTime - startTime; // Total hours in the range
  const intervalSeconds = Math.round((timeRangeHours * 60 * 60) / reminderFrequency); // Convert hours to seconds

  console.log(`Time range: ${timeRangeHours} hours, Interval: ${intervalSeconds} seconds`);

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

  console.log(`Notification scheduled with interval: ${intervalSeconds} seconds`);
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notificationPermission, setNotificationPermission] = useState<string | null>(null);
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Request notification permissions
  const requestPermission = async () => {
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
      setError("Error requesting notification permissions");
      console.error(err);
      return false;
    }
  };

  // Load settings and initialize notifications on mount
  useEffect(() => {
    const initializeNotifications = async () => {
      // Determine initial settings from Firebase or defaults
      let initialSettings = defaultSettings;
      if (user?.settings?.notifications) {
        initialSettings = {
          enabled: user.settings.notifications.enabled ?? defaultSettings.enabled,
          reminderFrequency:
            user.settings.notifications.reminderFrequency ?? defaultSettings.reminderFrequency,
          startTime: user.settings.notifications.startTime ?? defaultSettings.startTime,
          endTime: user.settings.notifications.endTime ?? defaultSettings.endTime,
          soundEnabled: user.settings.notifications.soundEnabled ?? defaultSettings.soundEnabled,
        };
        console.log("Loaded settings from Firebase:", initialSettings);
      }

      // Set settings synchronously before proceeding
      setSettings(initialSettings);

      // Request permissions and schedule with the initial settings
      const permissionGranted = await requestPermission();
      if (permissionGranted && initialSettings.enabled) {
        await scheduleNotifications(initialSettings);
      }
    };

    initializeNotifications();
  }, [user]); // Runs when user changes

  // Persist settings to Firestore and reschedule notifications
  const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);

      if (!user?.uid) throw new Error("No user ID available");

      const notificationData = {
        settings: {
          notifications: updatedSettings,
        },
        lastUpdated: new Date(),
      };

      const docRef = doc(db, `users/${user.uid}`);
      await setDoc(docRef, notificationData, { merge: true });

      if (updatedSettings.enabled && notificationPermission === "granted") {
        await scheduleNotifications(updatedSettings);
      } else {
        await Notifications.cancelAllScheduledNotificationsAsync();
      }
    } catch (err) {
      setError("Failed to update notification settings");
      console.error(err);
    }
  };

  const value = {
    notificationPermission,
    settings,
    error,
    requestPermission,
    updateSettings,
  };

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationsProvider");
  }
  return context;
}
