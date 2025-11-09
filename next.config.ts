import type { NextConfig } from "next";

const nextConfig: NextConfig = 
{
  images: {
    domains: [
      'rukfjkcqdjstwshdmnqv.supabase.co',
      // Add other domains if needed
    ],
    // Alternatively, you can use remotePatterns for more control:
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'rukfjkcqdjstwshdmnqv.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/avatars/**',
      },
    ],
  },
}
export default nextConfig;
