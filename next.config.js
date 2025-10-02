/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: '/smith_calculator',
  assetPrefix: '/smith_calculator',
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig 