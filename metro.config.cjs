// metro.config.cjs
const { getDefaultConfig } = require('@expo/metro-config');

// __dirname correctly points at your project root in CommonJS
module.exports = getDefaultConfig(__dirname);
