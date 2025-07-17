import 'dotenv/config';

export default ({ config }) => {
    // 0️ App version (CFBundleShortVersionString)
    config.version = "1.0.0";

    // 1️ Basic Expo config
    config.name = "Soundscape";
    config.slug = "soundscape";

    // 2️ Link your EAS project
    config.extra = {
        ...(config.extra ?? {}),
        eas: { projectId: "5a8a6b68-cb91-4ff3-bc44-586267f23fdd" },
    };

    // 3️ iOS-specific settings
    config.ios = {
        ...(config.ios ?? {}),
        bundleIdentifier: "com.tsglobal.soundscape",
        buildNumber: "10",
        infoPlist: {
            ITSAppUsesNonExemptEncryption: false,
            NSPhotoLibraryUsageDescription: "We need access to your photo library so you can select and import images into your scenes.",
            NSMicrophoneUsageDescription: "We need microphone access to listen to user command for handsoff operations.",
            NSSpeechRecognitionUsageDescription: "We need speech recognition to enable voice controls and commands."
        }
    };

    // 4️ Plugins
    const plugins = [
        "./plugins/expo-audio-filter-plugin.cjs",
        "./expo-plugins/with-patch-async-storage.cjs"
    ];
    if (process.env.EAS_BUILD_PROFILE === 'development') {
        plugins.push('expo-dev-client');
    }
    config.plugins = plugins;

    return config;
};
