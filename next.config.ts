import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // Only ignore build errors in development
    // ignoreBuildErrors: process.env.NODE_ENV === "development",
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
