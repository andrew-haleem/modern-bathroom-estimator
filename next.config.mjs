/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['better-sqlite3'],
  allowedDevOrigins: ['127.0.0.1', 'localhost', '0.0.0.0']
};

export default nextConfig;
