/** @type {import('next').NextConfig} */

const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*', // 请根据您的Laravel API地址修改
      },
    ];
  },
};

module.exports = nextConfig;
