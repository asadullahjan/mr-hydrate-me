import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import * as Notifications from "expo-notifications";
import { useAuth } from "@/components/Auth/AuthProvider"; // Adjust path
import { updateUserData } from "@/services/update-user-profile";
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
  requestPermission: () => Promise<void>;
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

  const { reminderFrequency, startTime, endTime, soundEnabled } = settings;
  const interval = (endTime - startTime) / reminderFrequency; // Hours between notifications
  const now = new Date();

  for (let i = 0; i < reminderFrequency; i++) {
    const trigger = new Date();
    trigger.setHours(startTime + i * interval, 0, 0, 0); // Evenly spaced within range
    if (trigger < now) continue; // Skip past triggers

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Time to Hydrate!",
        body: "Drink some water to stay on track.",
        sound: soundEnabled ? "default" : false,
      },
      trigger: {
        type: "date",
        date: trigger.setSeconds(now.getSeconds() + 5),
        repeats: true, // Daily repeat
      } as Notifications.DateTriggerInput,
    });
  }
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notificationPermission, setNotificationPermission] = useState<string | null>(null);
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Request notification permissions on mount
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
        setSettings((prev) => ({ ...prev, enabled: false }));
        return;
      }
      // Schedule notifications if enabled and permissions granted
      if (settings.enabled) {
        await scheduleNotifications(settings);
      }
    } catch (err) {
      setError("Error requesting notification permissions");
      console.error(err);
    }
  };

  // Load initial settings and request permissions
  useEffect(() => {
    if (user?.settings?.notifications) {
      setSettings({
        enabled: user.settings.notifications.enabled ?? defaultSettings.enabled,
        reminderFrequency:
          user.settings.notifications.reminderFrequency ?? defaultSettings.reminderFrequency,
        startTime: user.settings.notifications.startTime ?? defaultSettings.startTime,
        endTime: user.settings.notifications.endTime ?? defaultSettings.endTime,
        soundEnabled: user.settings.notifications.soundEnabled ?? defaultSettings.soundEnabled,
      });
    }
    requestPermission(); // Request permissions on app start
  }, [user]);

  // Persist settings to Firestore and reschedule notifications
  const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);

      if (!user?.uid) throw new Error("No user ID available");

      // Update Firestore
      const docRef = doc(db, `users/${user.uid}`);
      await setDoc(
        docRef,
        {
          settings: {
            ...updatedSettings,
          },
          lastUpdated: new Date(),
        },
        { merge: true }
      );

      // Schedule or cancel notifications
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
