import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercel/monorepo: ensure Next traces from the repo root even if multiple lockfiles exist.
  // This silences: "Next.js inferred your workspace root, but it may not be correct."
  outputFileTracingRoot: path.join(__dirname, ".."),
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
