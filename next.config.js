/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['drizzle-orm/libsql', '@libsql/client'],
    ppr: true,
  },
};

module.exports = nextConfig;
