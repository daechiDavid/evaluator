import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  serverExternalPackages: ["@google/genai", "mammoth", "exceljs", "file-type"],
  turbopack: { root: process.cwd() },
};

export default nextConfig;
