// plugins/expo-audio-filter-plugin.cjs
const {
    withDangerousMod,
    withXcodeProject,
} = require('@expo/config-plugins');
const fs = require('fs-extra');
const path = require('path');

module.exports = function expoAudioFilterPlugin(config) {
    // 1️⃣ Copy your Swift + Obj‑C source files into the generated ios/ folder
    config = withDangerousMod(config, {
        platform: 'ios',
        mod: async ({ modRequest, modResults }) => {
            const projectRoot = modRequest.projectRoot;
            const iosDir = path.join(projectRoot, 'ios');
            const srcDir = path.join(projectRoot, 'plugins', 'AudioFilter');

            // ensure the ios/ folder exists
            await fs.ensureDir(iosDir);

            // copy in the files
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

    // 2️⃣ Tell Xcode’s project to compile those files
    config = withXcodeProject(config, {
        mod: (ctx) => {
            const project = ctx.modResults;
            const target = project.getFirstTarget().uuid;

            // these paths are relative to ios/
            project.addSourceFile('AudioFilterModule.swift', null, target);
            project.addSourceFile('AudioFilterModuleBridge.m', null, target);

            return ctx;
        },
    });

    return config;
};
