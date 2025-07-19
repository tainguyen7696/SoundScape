// app.config.js
import 'dotenv/config';

export default ({ config }) => {
    // 0️⃣ App version (CFBundleShortVersionString)
    config.version = "1.0.0";

    // 1️⃣ Basic Expo config
    config.name = "Soundscape";
    config.slug = "soundscape";

    // 2️⃣ Link your EAS project
    config.extra = {
        ...(config.extra ?? {}),
        eas: { projectId: "69b2ff50-b5e1-4531-a72f-7f1d0c78c34b" },
    };

    // 3️⃣ iOS-specific settings
    config.ios = {
        ...(config.ios ?? {}),
        bundleIdentifier: "com.tsglobal.soundscape",
        buildNumber: "8", // this will be overridden by EAS_BUILD_NUMBER if you choose
        infoPlist: {
            ITSAppUsesNonExemptEncryption: false,
            NSPhotoLibraryUsageDescription:
                "We need access to your photo library so you can select and import images into your scenes.",
            NSMicrophoneUsageDescription:
                "We need microphone access to listen to user command for handsoff operations.",
            NSSpeechRecognitionUsageDescription:
                "We need speech recognition to enable voice controls and commands.",
        },
    };

    // 4️⃣ Plugins (including Firebase Crashlytics)
    const plugins = [
        // your existing plugins
        "./plugins/expo-audio-filter-plugin.cjs",
        "./expo-plugins/with-patch-async-storage.cjs",
    ];

    // expo-dev-client in development
    if (process.env.EAS_BUILD_PROFILE === "development") {
        plugins.push("expo-dev-client");
    }

    // React Native Firebase core & Crashlytics
    plugins.push("@react-native-firebase/app");
    plugins.push([
        "@react-native-firebase/crashlytics",
        {
            // optional: enable debug & manual collection
            crashlytics_debug_enabled: true,
            crashlytics_auto_collection_enabled: false,
        },
    ]);

    config.plugins = plugins;

    return config;
};
