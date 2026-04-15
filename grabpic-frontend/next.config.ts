import type { NextConfig } from "next";
import path from "path";

const backendOrigin = process.env.BACKEND_URL?.replace(/\/$/, "") || "http://127.0.0.1:3000";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [{ hostname: "lh3.googleusercontent.com" }],
  },
  allowedDevOrigins: ['192.168.29.97'],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendOrigin}/api/:path*`,
      },
    ];
  },
  /* config options here */
};

export default nextConfig;
