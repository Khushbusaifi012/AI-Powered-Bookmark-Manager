import type { NextConfig } from "next";
import { resolve } from "node:path";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "better-sqlite3",
    "@prisma/adapter-libsql",
    "@libsql/client",
  ],
  turbopack: {
    root: resolve(__dirname),
  },
};

export default nextConfig;
