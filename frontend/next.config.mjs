/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // This creates a standalone build for deployment
  experimental: {
    outputStandalone: true,
  }
};

export default nextConfig;
