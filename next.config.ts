// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  // your other config options...

  eslint: {
    // Disable ESLint during production builds
    ignoreDuringBuilds: process.env.NODE_ENV === 'production',
  },
};

module.exports = nextConfig;
