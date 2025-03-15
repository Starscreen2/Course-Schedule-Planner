/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Force Next.js to use SWC for compilation even with a custom Babel config
  experimental: {
    forceSwcTransforms: true,
  },
}

module.exports = nextConfig

