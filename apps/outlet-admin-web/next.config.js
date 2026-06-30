/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["https://outlets.dev.local:3000"],

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.dev.local",
        port: "4000",
        pathname: "/images/**",
      },
    ],
  },
};

module.exports = nextConfig;