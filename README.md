# Hydration Tracking App

## Overview

This application is designed to track and manage daily water intake, providing personalized hydration goals based on individual factors such as age, weight, and current weather conditions. The app helps users maintain optimal hydration levels by offering customized recommendations and an intuitive tracking interface.

## Purpose

Proper hydration is essential for health, yet many people struggle to consume appropriate amounts of water. This app addresses this challenge by:

- Tracking daily water consumption
- Providing personalized hydration goals
- Adjusting recommendations based on weather conditions
- Offering reminders to maintain consistent hydration

## Key Features

- **Personalized Hydration Goals**: Customized water intake recommendations based on user's age, weight, and other personal factors
- **Weather-Adaptive Recommendations**: Dynamic adjustments to hydration targets based on temperature and humidity
- **User-Friendly Interface**: Simple dashboard with quick-add buttons for common water volumes (250ml, 500ml, 1L)
- **Custom Entry Option**: Ability to log specific water intake amounts
- **Customizable Notifications**: Reminders to drink water at user-defined intervals
- **History Tracking**: View past hydration data and maintain streaks for consistent intake
- **Social Features**: Leaderboards and achievements to encourage engagement

## Code Structure

The application follows a modular folder structure:

```
app/
├── (auth)/                            # Authentication-related screens
│ ├── _layout.tsx
│ ├── signin.tsx
│ ├── signup.tsx
│ └── reset.tsx
|
├── (tabs)/                            # Main app tabs
| ├── _layout.tsx
│ ├── home.tsx                          # Water tracking dashboard
│ ├── history.tsx                       # Past hydration records
│ ├── leaderboard.tsx                   # Social comparison features
│ └── profile/                         # User profile management
│  ├── notificationSettings.tsx
│  ├── updateProfile.tsx
│  └── resetPassword.tsx
|
├── _layout.tsx                         # Main app layout
|
└── (onboarding)/                      # First-time user flow
  ├── _layout.tsx
  └── welcome.tsx

components/                            # UI components and providers
services/                              # API actions and external services
store/                                 # Zustand state management stores
util/                                  # Utility functions (including Firebase error handling based on code)
__tests__/                             # Testing files
```

## Installation Instructions

1. Download the APK from the Expo link provided
2. Install the application on your Android device
3. No additional configuration is required - the app works immediately after installation

## Testing Instructions

1. Go to MrHydrateMe directory
2. Run `npm test`

## Competitive Advantages

This hydration tracking app stands out from similar applications like HydrateMe and Water Reminder through:

- More sophisticated personalization of water intake calculations
- Real-time weather-based hydration adjustments
- Engaging social and gamification elements to improve user motivation
