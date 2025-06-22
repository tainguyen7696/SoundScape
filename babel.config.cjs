// babel.config.cjs
module.exports = function (api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            [
                'module-resolver',
                {
                    root: ['./src'],
                    alias: {
                        '@components': './src/components',
                        '@screens': './src/screens',
                        '@assets': './src/assets',
                        '@icons': './src/assets/icons',
                        '@navigation': './src/navigation',
                        '@hooks': './src/hooks',
                        '@context': './src/context',
                        '@utils': './src/utils',
                    },
                },
            ],
        ],
    };
};
