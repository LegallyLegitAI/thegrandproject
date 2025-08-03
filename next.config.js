/** @type {import('next').NextConfig} */
const nextConfig = {
  // The following webpack configuration is a workaround for a persistent caching
  // issue that can occur on Windows systems, often due to antivirus or file indexing
  // interfering with Next.js's file operations. This disables the persistent
  // cache during development, which resolves the 'ENOENT: no such file or directory, rename'
  // error without significantly impacting performance for most projects.
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.cache = false;
    }
    return config;
  },
};

module.exports = nextConfig;
