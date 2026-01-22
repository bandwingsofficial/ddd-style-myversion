/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // 1. Allow self-signed SSL certificates (Required for .dev.local domains)
  httpAgentOptions: {
    rejectUnauthorized: false,
  },

  // 2. Setup the Image Proxy
  async rewrites() {
    return [
      {
        source: '/images/:path*',
        // We point this to the EXACT URL from your Postman screenshot
        destination: 'https://admin.dev.local:4000/images/:path*', 
      },
    ];
  },
};

module.exports = nextConfig;