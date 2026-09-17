/** @type {import('next').NextConfig} */
const nextConfig = {
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

