export default {
  expo: {
    name: "MrHydrateMe",
    slug: "TestMrHydrateMe",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/droplet-favicon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/droplet-favicon.png",
        backgroundColor: "#ffffff",
      },
      package: "com.asadullahjan.TestMrHydrateMe",
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/droplet-favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/droplet.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {
        origin: false,
      },
      eas: {
        projectId: "bfb76f6c-f39a-4180-a2ba-b6402869429f",
      },
      apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    },
    owner: "asadullahjan",
  },
};
