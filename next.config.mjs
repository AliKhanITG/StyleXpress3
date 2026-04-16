/** @type {import('next').NextConfig} */
const sanitizeApiUrl = (value) => {
  const raw = String(value ?? "").trim();
  if (!raw || raw.toLowerCase() === "undefined" || raw.toLowerCase() === "null") {
    return "";
  }
  const normalized = raw.replace(
    /^https?:\/\/stylexpress3\.scmcloud\.online(?=\/|$)/i,
    "https://stylexpress3api.scmcloud.online"
  );
  if (!normalized.startsWith("http://") && !normalized.startsWith("https://")) {
    return "";
  }
  return normalized.replace(/\/+$/, "").replace(/\/api$/i, "");
};

const apiUrl = sanitizeApiUrl(process.env.NEXT_PUBLIC_API_URL);

const nextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
      { protocol: "https", hostname: "**" },
    ],
  },
  async rewrites() {
    if (apiUrl) {
      return [
        {
          source: "/api/:path*",
          destination: `${apiUrl}/api/:path*`,
        },
      ];
    }

    if (process.env.NODE_ENV === "development") {
      return [
        {
          source: "/api/:path*",
          destination: "http://localhost:5051/api/:path*",
        },
      ];
    }

    return [];
  },
};

export default nextConfig;
