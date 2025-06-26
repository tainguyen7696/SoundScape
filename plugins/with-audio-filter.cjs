// plugins/with-audio-filter.js
const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

module.exports = function withAudioFilter(config) {
    // Copy Android template
    config = withDangerousMod(config, [
        'android',
        async ({ modResults, modRequest }) => {
            const to = path.join(
                modRequest.projectRoot,
                'android/app/src/main/java/com/tai/soundscape/AudioFilterModule.java'
            );
            const from = path.join(__dirname, 'templates/AudioFilterModule.java');
            fs.copyFileSync(from, to);
            return modResults;
        },
    ]);

    // Copy iOS template
    config = withDangerousMod(config, [
        'ios',
        async ({ modResults, modRequest }) => {
            // Adjust “YourAppName” to your actual Xcode target name
            const to = path.join(
                modRequest.projectRoot,
                'ios/soundscape/AudioFilterModule.swift'
            );
            const bridge = path.join(
                modRequest.projectRoot,
                'ios/soundscape/AudioFilterModuleBridge.m'
            );
            fs.copyFileSync(
                path.join(__dirname, 'templates/AudioFilterModule.swift'),
                to
            );
            fs.copyFileSync(
                path.join(__dirname, 'templates/AudioFilterModuleBridge.m'),
                bridge
            );
            return modResults;
        },
    ]);

    return config;
};
