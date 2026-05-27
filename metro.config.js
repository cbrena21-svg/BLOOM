const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Soportar archivos .mjs de lucide-react-native
config.resolver.sourceExts.push('mjs');

module.exports = config;