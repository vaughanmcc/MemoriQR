/** @type {import('next').NextConfig} */
const nextConfig = {
  // Skip TypeScript type checking during build (types will be fully validated after Supabase setup)
  typescript: {
    ignoreBuildErrors: true,
  },
  // Skip ESLint during build for now
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/**',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        pathname: '/**',
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async redirects() {
    return [
      {
        source: '/m/:slug',
        destination: '/memorial/:slug',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
