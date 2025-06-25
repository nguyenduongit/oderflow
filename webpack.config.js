// webpack.config.js
/* eslint-env node */ 
const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

// Define __dirname if it's not available (e.g., in ES modules)
// const __dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(new URL(import.meta.url).pathname);

module.exports = async function (env, argv) {
  // Lấy cấu hình webpack mặc định của Expo
  const config = await createExpoWebpackConfigAsync(env, argv);

  // Tùy chỉnh cấu hình
  if (config.resolve.alias) {
    // Thêm alias của chúng ta vào
    config.resolve.alias['@'] = path.resolve(__dirname, 'src/');
  }

  return config;
};