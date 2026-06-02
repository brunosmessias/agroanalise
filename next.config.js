/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  serverExternalPackages: ["postgres"],
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000",
      },
    ],
  },
};

export default config;
