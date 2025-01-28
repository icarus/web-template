import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dfmas.df.cl',
      },
      {
        protocol: 'https',
        hostname: 'i.pinimg.com',
      },
      {
        protocol: 'https',
        hostname: 'media.licdn.com',
      },
    ],
  },
  // Configure other necessary Next.js settings here

  // Example: If using environment variables
  // env: {
  //   CUSTOM_VAR: process.env.CUSTOM_VAR,
  // },
};

export default nextConfig;
