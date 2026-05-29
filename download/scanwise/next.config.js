/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "openfoodfacts.org",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.openfoodfacts.org",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "static.openfoodfacts.org",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
