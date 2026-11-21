import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,

  images: {
    // Photos are replaced under the same file names; re-check them after a
    // minute instead of Next 16's 4-hour default so new photos show up quickly.
    minimumCacheTTL: 60,
    // Allowed optimisation qualities: the portrait and lightbox use the higher ones.
    qualities: [75, 85, 90, 95],
  },

  // react-pdf loads its built-in font metrics from disk at runtime,
  // so it must stay outside the server bundle.
  serverExternalPackages: ["@react-pdf/renderer"],

  // The PDF routes read fonts and photos from /public when they (re)render.
  outputFileTracingIncludes: {
    "/biodata.pdf": ["./public/fonts/**", "./public/photos/**"],
    "/biodata-hindi.pdf": ["./public/fonts/**", "./public/photos/**"],
  },

  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
