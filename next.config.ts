import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheMaxMemorySize: 0, // Required for Amplify hosting to work properly with ISR
  trailingSlash: true, // Sometimes required for Amplify
};

export default nextConfig;
