// plugins/expo-audio-filter-plugin.cjs
const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs-extra');
const path = require('path');

module.exports = function expoAudioFilterPlugin(config) {
    return withDangerousMod(config, [
        'ios',
        async ({ modRequest }) => {
            const projectRoot = modRequest.projectRoot;
            const iosDir = path.join(projectRoot, 'ios');

            const srcDir = path.join(projectRoot, 'plugins', 'AudioFilter');

            // Copy Swift implementation to ios/
            await fs.copy(
                path.join(srcDir, 'AudioFilterModule.swift'),
                path.join(iosDir, 'AudioFilterModule.swift')
            );
            // Copy Objective-C bridge to ios/
            await fs.copy(
                path.join(srcDir, 'AudioFilterModuleBridge.m'),
                path.join(iosDir, 'AudioFilterModuleBridge.m')
            );

            return config;
        },
    ]);
};
