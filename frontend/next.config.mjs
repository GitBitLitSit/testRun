/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.qrserver.com',
        pathname: '/v1/**',
      },
    ],
  },
}

export default nextConfig
