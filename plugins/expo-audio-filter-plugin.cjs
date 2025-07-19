// plugins/expo-audio-filter-plugin.cjs
const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs-extra');
const path = require('path');

module.exports = function expoAudioFilterPlugin(config) {
    return withDangerousMod(config, 'ios', async ({ modRequest, modResults }) => {
        const projectRoot = modRequest.projectRoot;
        const podfilePath = path.join(projectRoot, 'ios', 'Podfile');
        let contents = await fs.readFile(podfilePath, 'utf8');

        const podLine = `  pod 'AudioFilterModule', :path => '../plugins/AudioFilter'`;

        if (!contents.includes(podLine)) {
            contents = contents.replace(
                /(use_expo_modules!\s*\n)/,
                `$1${podLine}\n`
            );
            await fs.writeFile(podfilePath, contents);
        }

        return modResults;
    });
};
