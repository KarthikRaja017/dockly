/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias['rc-util/es/React/isFragment'] = path.resolve(
      __dirname,
      'node_modules/rc-util/es/React/isFragment.js'
    );
    return config;
  }
};

module.exports = nextConfig;