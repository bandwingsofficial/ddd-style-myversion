/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dev.local',
        port: '4000',
        pathname: '/images/**',
      },
    ],
  },
};

module.exports = nextConfig;
