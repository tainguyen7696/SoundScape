// webpack.config.js
const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // Alias the exact file the TrackPlayer web adapter wants
  config.resolve.alias['shaka-player/dist/shaka-player.ui'] =
    path.resolve(__dirname, 'node_modules/shaka-player/dist/shaka-player.ui.js');

  return config;
};
