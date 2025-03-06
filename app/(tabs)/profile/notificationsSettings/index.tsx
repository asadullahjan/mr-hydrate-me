import React, { useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import {
  Text,
  TextInput,
  Button,
  Checkbox,
  HelperText,
  useTheme,
  Divider,
  Switch,
} from "react-native-paper";
import { useRouter } from "expo-router";
import {
  NotificationSettings,
  useNotifications,
} from "@/components/Notifications/NotificationsProvider";
import { MaterialIcons } from "@expo/vector-icons";

const notificationSettings = [
  {
    field: "enabled",
    question: "Enable Notifications",
    description: "Turn on/off all notification alerts",
    icon: "notifications",
    type: "checkbox",
    validate: (value: boolean) => true,
  },
  {
    field: "reminderFrequency",
    question: "Daily Reminders",
    description: "How many times per day you want to be reminded",
    icon: "update",
    type: "number",
    placeholder: "e.g., 4",
    validate: (value: number) => !isNaN(value) && value > 0 && value <= 24,
  },
  {
    field: "startTime",
    question: "Start Time",
    description: "When to begin sending notifications (24-hour format)",
    icon: "access-time",
    type: "number",
    placeholder: "e.g., 8 for 8 AM",
    validate: (value: number) => !isNaN(value) && value >= 0 && value <= 23,
  },
  {
    field: "endTime",
    question: "End Time",
    description: "When to stop sending notifications (24-hour format)",
    icon: "bedtime",
    type: "number",
    placeholder: "e.g., 20 for 8 PM",
    validate: (value: number, formData: NotificationSettings) =>
      !isNaN(value) && value >= formData.startTime && value <= 23,
  },
  {
    field: "soundEnabled",
    question: "Notification Sound",
    description: "Play a sound when notifications arrive",
    icon: "volume-up",
    type: "checkbox",
    validate: (value: boolean) => true,
  },
] as const;

export default function NotificationsSettings() {
  const theme = useTheme();
  const router = useRouter();
  const { settings, updateSettings } = useNotifications();

  const [formData, setFormData] = useState(settings);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: string, value: string | boolean) => {
    const newValue =
      typeof value === "string" &&
      (field === "reminderFrequency" || field === "startTime" || field === "endTime")
        ? Number(value) || 0
        : value;
    setFormData((prev) => ({ ...prev, [field]: newValue }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    notificationSettings.forEach((setting) => {
      const value = formData[setting.field as keyof NotificationSettings];
      if (setting.type === "checkbox") {
        if (!setting.validate(value as boolean)) {
          newErrors[setting.field] = `Please provide a valid ${setting.field
            .replace(/([A-Z])/g, " $1")
            .toLowerCase()}`;
        }
      } else if (setting.type === "number") {
        if (!setting.validate(value as number, formData)) {
          newErrors[setting.field] = `Please provide a valid ${setting.field
            .replace(/([A-Z])/g, " $1")
            .toLowerCase()}`;
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await updateSettings(formData);
      console.log("Notification settings updated successfully");
      router.back();
    } catch (err) {
      console.error("Error updating notification settings:", err);
      setErrors((prev) => ({ ...prev, general: "Failed to update settings. Please try again." }));
    } finally {
      setIsLoading(false);
    }
  };

  // Check if notifications are enabled
  const notificationEnabled = !!formData.enabled;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text
          variant="headlineMedium"
          style={[styles.title, { color: theme.colors.primary }]}
        >
          Notification Settings
        </Text>

        {notificationSettings.map((setting, index) => {
          // Determine if this field should be disabled
          const isDisabled = setting.field !== "enabled" && !notificationEnabled;

          return (
            <React.Fragment key={setting.field}>
              <View style={[styles.settingContainer, isDisabled ? styles.disabledContainer : null]}>
                <View style={styles.settingHeader}>
                  <MaterialIcons
                    name={setting.icon as any}
                    size={24}
                    color={theme.colors.primary}
                    style={styles.settingIcon}
                  />
                  <View style={styles.settingTextContainer}>
                    <View style={styles.titleRow}>
                      <Text
                        variant="titleMedium"
                        style={[styles.settingTitle, isDisabled ? styles.disabledText : null]}
                      >
                        {setting.question}
                      </Text>

                      {/* Checkbox controls moved to be next to the label */}
                      {setting.type === "checkbox" && (
                        <Switch
                          value={!!formData[setting.field as keyof NotificationSettings]}
                          onValueChange={(value) => handleChange(setting.field, value)}
                          disabled={isDisabled && setting.field !== "soundEnabled"}
                          style={styles.switch}
                        />
                      )}
                    </View>
                    <Text
                      variant="bodySmall"
                      style={[styles.settingDescription, isDisabled ? styles.disabledText : null]}
                    >
                      {setting.description}
                    </Text>
                  </View>
                </View>

                {setting.type === "number" ? (
                  <>
                    <TextInput
                      mode="outlined"
                      placeholder={setting.placeholder}
                      value={String(formData[setting.field as keyof NotificationSettings] || "")}
                      onChangeText={(value) => handleChange(setting.field, value)}
                      keyboardType="numeric"
                      style={styles.input}
                      error={!!errors[setting.field]}
                      outlineColor={theme.colors.primary}
                      activeOutlineColor={theme.colors.primary}
                      disabled={isDisabled}
                    />
                    {errors[setting.field] && (
                      <HelperText
                        type="error"
                        visible={!!errors[setting.field]}
                      >
                        {errors[setting.field]}
                      </HelperText>
                    )}
                  </>
                ) : null}
              </View>
              {index < notificationSettings.length - 1 && <Divider style={styles.divider} />}
            </React.Fragment>
          );
        })}

        {errors.general && (
          <HelperText
            type="error"
            visible={!!errors.general}
          >
            {errors.general}
          </HelperText>
        )}
        <View style={{ flexDirection: "row", gap: 5 }}>
          <Button
            mode="outlined"
            onPress={() => router.back()}
            loading={isLoading}
            disabled={isLoading}
            style={styles.button}
            labelStyle={{ color: theme.colors.primary }}
          >
            cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={isLoading}
            disabled={isLoading}
            style={styles.button}
            labelStyle={{ color: theme.colors.onPrimary }}
          >
            Save
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#fff",
    marginTop: 8,
  },
  button: {
    marginTop: 20,
    flex: 1,
  },
  settingContainer: {
    marginVertical: 12,
  },
  disabledContainer: {
    opacity: 0.7,
  },
  settingHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  settingIcon: {
    marginRight: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  settingTitle: {
    fontWeight: "600",
    color: "#334155",
    flex: 1,
  },
  settingDescription: {
    color: "#64748b",
  },
  disabledText: {
    color: "#9ca3af",
  },
  divider: {
    marginVertical: 12,
    backgroundColor: "#e2e8f0",
  },
  switch: {
    marginLeft: 8,
  },
});
