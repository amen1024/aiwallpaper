/** @type {import('next').NextConfig} */
import { setupDevPlatform } from "@cloudflare/next-on-pages/next-dev";
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'test01.446e9fed1d43fd586a45c3d6e16fbd6f.r2.cloudflarestorage.com',
      },
      {
        protocol: 'https',
        hostname: 'pub-a19e33424475415f8e08b612c5d2dc70.r2.dev',
      },
      {
        protocol: 'https',
        hostname: 'www.baidu.com',
      },
    ],
  },
};

if (process.env.NODE_ENV === "development") {
  await setupDevPlatform();
}

export default nextConfig; 
