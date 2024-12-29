import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

export default withNextIntl({
  i18n: {
    locales: ['en', 'es'],
    defaultLocale: 'es',
  },
  webpack(config) {
    return config;
  },
  nextIntl: {
    request: './app/i18n/request.ts',
  },
});
