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
  // Allow iframe embedding from WordPress (LocalWP in DEV, Hostinger in PROD)
  async headers() {
    return [
      {
        // Apply to embeddable routes (memorial viewer, activation, order)
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            // SAMEORIGIN is more restrictive; we remove it to allow cross-origin embedding
            // Security is handled via Content-Security-Policy frame-ancestors instead
            value: 'ALLOWALL',
          },
          {
            key: 'Content-Security-Policy',
            // Allow embedding from localhost (LocalWP) and production WordPress domain
            // Update memoriqr.com to your actual domain when deploying
            value: "frame-ancestors 'self' http://localhost:* https://localhost:* http://*.local https://*.local https://memoriqr.com https://memoriqr.co.nz https://*.memoriqr.com https://*.memoriqr.co.nz",
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
