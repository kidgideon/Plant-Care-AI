import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    domains: ["firebasestorage.googleapis.com"], // allow Firebase Storage images
  },
};

export default nextConfig;
