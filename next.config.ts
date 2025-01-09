import { NextConfig } from 'next';
import withNextIntl from 'next-intl/plugin';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Remove the 'i18n' property and any 'nextIntl' keys
  // Configure other necessary Next.js settings here

  // Example: If using environment variables
  // env: {
  //   CUSTOM_VAR: process.env.CUSTOM_VAR,
  // },
};

// Configure next-intl for internationalization
export default withNextIntl('./i18n.config.ts')(nextConfig);
