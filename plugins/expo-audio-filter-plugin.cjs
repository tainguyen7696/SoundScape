// plugins/expo-audio-filter-plugin.cjs
const {
    withDangerousMod,
    withXcodeProject,
} = require('@expo/config-plugins');
const fs = require('fs-extra');
const path = require('path');

module.exports = function expoAudioFilterPlugin(config) {
    // 1️⃣ Copy the Swift + Obj‑C source files into ios/
    config = withDangerousMod(config, {
        platform: 'ios',
        mod: async ({ modResults, modRequest }) => {
            const projectRoot = modRequest.projectRoot;
            const iosDir = path.join(projectRoot, 'ios');
            const srcDir = path.join(projectRoot, 'plugins', 'AudioFilter');

            await fs.copy(
                path.join(srcDir, 'AudioFilterModule.swift'),
                path.join(iosDir, 'AudioFilterModule.swift')
            );
            await fs.copy(
                path.join(srcDir, 'AudioFilterModuleBridge.m'),
                path.join(iosDir, 'AudioFilterModuleBridge.m')
            );

            return modResults;
        },
    });

    // 2️⃣ Tell Xcode about those files so they actually get compiled
    config = withXcodeProject(config, {
        mod: (config) => {
            const pbxProject = config.modResults;
            // Grab the first app target (usually your only one)
            const targetUuid = pbxProject.getFirstTarget().uuid;

            // Paths here are relative to ios/ in your project
            pbxProject.addSourceFile(
                'AudioFilterModule.swift',
        /* group */ null,
                targetUuid
            );
            pbxProject.addSourceFile(
                'AudioFilterModuleBridge.m',
        /* group */ null,
                targetUuid
            );

            return config;
        },
    });

    return config;
};
