import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // Required for proper Docker deployment (copies only needed files)
    output: "standalone",

    // Allow long-lived SSE connections on the stream route (no timeout)
    experimental: {
        serverActions: {
            bodySizeLimit: "2mb",
        },
    },
};

export default nextConfig;
