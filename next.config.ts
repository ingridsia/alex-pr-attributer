import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/alex-pr-attributer",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
