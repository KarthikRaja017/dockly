/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // Fix missing .js extensions in imports
    config.resolve.alias['rc-util/es/React/isFragment'] = path.resolve(
      __dirname,
      'node_modules/rc-util/es/React/isFragment.js'
    );
    config.resolve.alias['rc-util/es/warning'] = path.resolve(
      __dirname,
      'node_modules/rc-util/es/warning.js'
    );
    config.resolve.alias['rc-tree/es/TreeNode'] = path.resolve(
      __dirname,
      'node_modules/rc-tree/es/TreeNode.js'
    );
    return config;
  },
};

module.exports = nextConfig;
