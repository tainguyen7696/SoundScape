const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs/promises');
const path = require('path');

module.exports = function withPatchAsyncStorage(config) {
    return withDangerousMod(config, [
        'ios',
        async (config) => {
            const podfilePath = path.join(config.modRequest.projectRoot, 'ios', 'Podfile');
            let podfile = await fs.readFile(podfilePath, 'utf8');

            // Replace any existing RNCAsyncStorage line with our :path override
            podfile = podfile.replace(
                /pod ['"]RNCAsyncStorage['"][^\n]*/g,
                `pod 'RNCAsyncStorage', :path => '../node_modules/@react-native-async-storage/async-storage/ios'`
            );

            await fs.writeFile(podfilePath, podfile);
            return config;
        },
    ]);
};
