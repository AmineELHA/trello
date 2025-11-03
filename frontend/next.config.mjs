/** @type {import('next').NextConfig} */
const nextConfig = {
  // Only use standalone output for production builds
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  async rewrites() {
    return [
      // Proxy API requests to the Rails backend
      {
        source: '/api/:path*',
        destination: process.env.BACKEND_URL ? `${process.env.BACKEND_URL}/api/:path*` : 'http://localhost:8080/api/:path*'
      },
      {
        source: '/graphql',
        destination: process.env.BACKEND_URL ? `${process.env.BACKEND_URL}/graphql` : 'http://localhost:8080/graphql'
      },
      {
        source: '/graphql/:path*',
        destination: process.env.BACKEND_URL ? `${process.env.BACKEND_URL}/graphql/:path*` : 'http://localhost:8080/graphql/:path*'
      }
    ]
  }
};

export default nextConfig;
