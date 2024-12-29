const { i18n } = require('./next-i18next.config')

/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n,
  images: {
    formats: ['image/webp'],
  },
  reactStrictMode: true,
}

module.exports = nextConfig
