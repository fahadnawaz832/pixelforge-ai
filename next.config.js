/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { serverComponentsExternalPackages: ["sharp"] },
  eslint: { ignoreDuringBuilds: true }
};
module.exports = nextConfig;
