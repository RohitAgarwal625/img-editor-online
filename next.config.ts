import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The browser calls the engine host directly, so its address must be in the
  // browser bundle. Accept either ENGINE_URL or NEXT_PUBLIC_ENGINE_URL.
  env: {
    NEXT_PUBLIC_ENGINE_URL:
      process.env.NEXT_PUBLIC_ENGINE_URL || process.env.ENGINE_URL || "",
  },
  serverExternalPackages: ["onnxruntime-node", "sharp"],
  webpack: (config) => {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };
    return config;
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "credentialless" },
        ],
      },
    ];
  },
};

export default nextConfig;
