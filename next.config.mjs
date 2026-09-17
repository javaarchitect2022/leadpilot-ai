/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  poweredByHeader: false,
  async rewrites() {
    return [
      {
        source: "/api/openapi.json",
        destination: "/api/openapi-spec",
      },
    ];
  },
};

export default nextConfig;

