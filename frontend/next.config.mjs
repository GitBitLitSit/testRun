const requiredEnv = ["NEXT_PUBLIC_API_URL"]
if (process.env.NODE_ENV === "production") {
  const missing = requiredEnv.filter((key) => !process.env[key])
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`)
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
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
    unoptimized: true
  },
}

export default nextConfig
