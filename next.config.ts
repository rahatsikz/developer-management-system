// next.config.ts
import { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  // remove 'experimental.appDir'
  // any other Next.js options you have go here
};

export default withBundleAnalyzer(nextConfig);
