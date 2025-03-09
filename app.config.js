export default {
  expo: {
    name: "MrHydrateMe",
    slug: "MrHydrateMe",
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
      package: "com.asadullahjan.MrHydrateMe",
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
        projectId: "3b596c1f-bb7a-4265-9078-ba3e84858191",
      },
      apiKey: process.env.API_KEY,
      authDomain: process.env.AUTH_DOMAIN,
      projectId: process.env.PROJECT_ID,
      storageBucket: process.env.STORAGE_BUCKET,
      messagingSenderId: process.env.MESSAGING_SENDER_ID,
      appId: process.env.APP_ID,
    },
  },
};
