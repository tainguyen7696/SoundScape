// app.config.js
import 'dotenv/config';

export default ({ config }) => {
    config.version = "1.0.0";
    config.name = "Soundscape";
    config.slug = "soundscape";

    config.extra = {
        ...(config.extra ?? {}),
        eas: { projectId: "69b2ff50-b5e1-4531-a72f-7f1d0c78c34b" },
    };

    config.ios = {
        ...(config.ios ?? {}),
        bundleIdentifier: "com.tsglobal.soundscape",
        buildNumber: "12",
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

    const plugins = [
        "./plugins/expo-audio-filter-plugin.cjs",
        "./plugins/with-patch-async-storage.cjs",
    ];

    // expo-dev-client in development
    if (process.env.EAS_BUILD_PROFILE === "development") {
        plugins.push("expo-dev-client");
    }

    config.plugins = plugins;

    return config;
};
