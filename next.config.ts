import type {NextConfig} from 'next';

import withPWA from 'next-pwa';

const isProduction = process.env.NODE_ENV === 'production';

const withPWAConfig = withPWA({
  dest: 'public',
});

const nextConfig = withPWAConfig({
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
}
);

export default nextConfig;
