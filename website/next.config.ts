import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /* next/image refuses remote hosts it has not been told about, and the
       cinematic-list demo data points at 21st.dev's CDN. */
    remotePatterns: [{ protocol: 'https', hostname: 'cdn.21st.dev' }],
  },
};

export default nextConfig;
