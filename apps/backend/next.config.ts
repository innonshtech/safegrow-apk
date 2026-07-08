import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@safegrow/ui", "@safegrow/config", "@safegrow/types", "@safegrow/utils", "@safegrow/shared"],
  serverExternalPackages: ["@prisma/client", "bcrypt"],
};

export default nextConfig;
