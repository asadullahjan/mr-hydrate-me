import React, { useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { Text, TextInput, Button, Switch, HelperText, useTheme, Divider } from "react-native-paper";
import { useRouter } from "expo-router";
import {
  NotificationSettings,
  useNotifications,
} from "@/components/Notifications/NotificationsProvider";
import { MaterialIcons } from "@expo/vector-icons";

// List of notification settings
const notificationSettings = [
  {
    field: "enabled",
    question: "Enable Notifications",
    description: "Turn on/off all notification alerts",
    icon: "notifications",
    type: "checkbox",
    validate: (value: boolean) => true,
    validationError: "",
  },
  {
    field: "reminderFrequency",
    question: "Daily Reminders",
    description: "How many times per day you want to be reminded",
    icon: "update",
    type: "number",
    placeholder: "e.g., 4",
    validate: (value: number) => !isNaN(value) && value > 0 && value <= 24,
    validationError: "Must be between 1 and 24",
  },
  {
    field: "startTime",
    question: "Start Time",
    description: "When to begin sending notifications (24-hour format)",
    icon: "access-time",
    type: "number",
    placeholder: "e.g., 8 for 8 AM",
    validate: (value: number) => !isNaN(value) && value >= 0 && value <= 23,
    validationError: "Must be between 0 and 23",
  },
  {
    field: "endTime",
    question: "End Time",
    description: "When to stop sending notifications (24-hour format)",
    icon: "bedtime",
    type: "number",
    placeholder: "e.g., 20 for 8 PM",
    validate: (value: number, formData?: NotificationSettings) =>
      !isNaN(value) && value >= (formData?.startTime ?? 0) && value <= 23,
    validationError: "Must be between start time and 23",
  },
  {
    field: "soundEnabled",
    question: "Notification Sound",
    description: "Play a sound when notifications arrive",
    icon: "volume-up",
    type: "checkbox",
    validate: (value: boolean) => true,
    validationError: "",
  },
] as const;

/**
 * NotificationsSettings screen allows users to configure notification preferences.
 */
const NotificationsSettings = () => {
  // Hooks for theme, routing, and notification settings
  const { colors } = useTheme();
  const router = useRouter();
  const { settings, updateSettings } = useNotifications();

  // State for form data, errors, and loading
  const [formData, setFormData] = useState<NotificationSettings>(settings);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Updates form data based on user input.
   * @param field - The setting field to update
   * @param value - The new value (string or boolean)
   */
  const handleChange = (field: keyof NotificationSettings, value: string | boolean) => {
    const newValue =
      typeof value === "string" &&
      (field === "reminderFrequency" || field === "startTime" || field === "endTime")
        ? Number(value) || 0
        : value;
    setFormData((prev) => ({ ...prev, [field]: newValue }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  /**
   * Validates the form data and updates errors.
   * @returns True if the form is valid, false otherwise
   */
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    notificationSettings.forEach((setting) => {
      const value = formData[setting.field];
      if (
        setting.type === "number"
          ? !setting.validate(value as number, formData)
          : !setting.validate(value as boolean)
      ) {
        newErrors[setting.field] = setting.validationError;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles form submission by updating settings and navigating back.
   */
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await updateSettings(formData);
      router.back();
    } catch (err) {
      console.error("Error updating notification settings:", err);
      if (err instanceof Error && "field" in err && "message" in err) {
        setErrors((prev) => ({ ...prev, [(err as any).field]: (err as any).message }));
      } else {
        setErrors((prev) => ({ ...prev, general: "Failed to update settings. Please try again." }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const notificationEnabled = !!formData.enabled;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Title */}
      <Text
        variant="headlineMedium"
        style={[styles.title, { color: colors.primary }]}
      >
        Notification Settings
      </Text>

      {/* Notification Settings List */}
      {notificationSettings.map((setting, index) => {
        const isDisabled = setting.field !== "enabled" && !notificationEnabled;

        return (
          <React.Fragment key={setting.field}>
            <View style={[styles.settingContainer, isDisabled && styles.disabledContainer]}>
              {/* Setting Header */}
              <View style={styles.settingHeader}>
                <MaterialIcons
                  name={setting.icon as any}
                  size={24}
                  color={colors.primary}
                  style={styles.settingIcon}
                />
                <View style={styles.settingTextContainer}>
                  <View style={styles.titleRow}>
                    <Text
                      variant="titleMedium"
                      style={[styles.settingTitle, isDisabled && styles.disabledText]}
                    >
                      {setting.question}
                    </Text>
                    {setting.type === "checkbox" && (
                      <Switch
                        value={!!formData[setting.field]}
                        onValueChange={(value) => handleChange(setting.field, value)}
                        disabled={isDisabled && setting.field !== "soundEnabled"}
                        style={styles.switch}
                      />
                    )}
                  </View>
                  <Text
                    variant="bodySmall"
                    style={[styles.settingDescription, isDisabled && styles.disabledText]}
                  >
                    {setting.description}
                  </Text>
                </View>
              </View>

              {/* Number Input */}
              {setting.type === "number" && (
                <>
                  <TextInput
                    mode="outlined"
                    placeholder={setting.placeholder}
                    value={String(formData[setting.field] || "")}
                    onChangeText={(value) => handleChange(setting.field, value)}
                    keyboardType="numeric"
                    style={styles.input}
                    error={!!errors[setting.field]}
                    outlineColor={colors.primary}
                    activeOutlineColor={colors.primary}
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
              )}
            </View>
            {index < notificationSettings.length - 1 && <Divider style={styles.divider} />}
          </React.Fragment>
        );
      })}

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <Button
          mode="outlined"
          onPress={() => router.navigate('/(tabs)/profile')}
          disabled={isLoading}
          style={styles.button}
          labelStyle={{ color: colors.primary }}
        >
          Cancel
        </Button>
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={isLoading}
          disabled={isLoading}
          style={styles.button}
          labelStyle={{ color: colors.onPrimary }}
        >
          Save
        </Button>
      </View>
    </ScrollView>
  );
};

// Styles for the NotificationsSettings component
const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
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
  input: {
    backgroundColor: "#fff",
    marginTop: 8,
  },
  divider: {
    marginVertical: 12,
    backgroundColor: "#e2e8f0",
  },
  switch: {
    marginLeft: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },
  button: {
    flex: 1,
  },
});

export default NotificationsSettings;
