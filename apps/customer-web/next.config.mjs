/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add this rewrites function
  async rewrites() {
    return [
      {
        source: '/images/:path*',
        destination: 'http://localhost:4000/images/:path*', // Proxy to Backend
      },
    ];
  },
};

export default nextConfig;