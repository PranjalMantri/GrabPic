import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    domains: ["lh3.googleusercontent.com"],
  },
  /* config options here */
};

export default nextConfig;
