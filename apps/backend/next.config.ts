import type { NextConfig } from "next";

import path from "path";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname, "../../"),
  transpilePackages: ["@safegrow/ui", "@safegrow/config", "@safegrow/types", "@safegrow/utils", "@safegrow/shared"],
  serverExternalPackages: ["@prisma/client", "bcrypt"],
};

export default nextConfig;
