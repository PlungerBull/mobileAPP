// app.config.js
import dotenv from 'dotenv'; // 👈 ADD THIS LINE
dotenv.config();              // 👈 AND THIS LINE

// ---
// ⚠️ COME UP WITH A BUNDLE ID. IT MUST BE UNIQUE.
// ---
const myBundleIdentifier = "com.PB.mobilefinance"; // 👈 YOU CAN USE THIS
// ---


export default {
  expo: {
    name: "mobileiOS",
    slug: "mobileiOS",
    version: "1.0.0",
    main: "expo-router/entry",
    scheme: "mobileios",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    
    // ---
    //  edilmesi THIS IS THE IOS BLOCK WE ADDED BACK
    // ---
    ios: {
      supportsTablet: true,
      bundleIdentifier: myBundleIdentifier // 👈 THE MISSING FIELD
    },
    
    // ---
    //  edilmesi THIS IS THE ANDROID BLOCK WE ADDED BACK
    // ---
    android: {
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png"
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      "package": myBundleIdentifier // 👈 Good to add this for Android too
    },
    
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/splash-icon.png",
          "imageWidth": 200,
          "resizeMode": "contain",
          "backgroundColor": "#ffffff",
          "dark": {
            "backgroundColor": "#000000"
          }
        }
      ]
    ],
    experiments: {
      "typedRoutes": true,
      "reactCompiler": true
    },
    extra: {
      // These are your Supabase keys
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,

      // This is the EAS Project ID
      "eas": {
        "projectId": "aa4e1798-5689-4b2e-86b0-517aa56f996c"
      }
    }
  }
};