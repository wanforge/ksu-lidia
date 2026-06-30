/** @type {import('next').NextConfig} */

// Conservative security headers for an internal back-office app. The CSP is
// intentionally permissive for inline/eval scripts because the Isomorphic
// template and Next.js runtime rely on them; frame-ancestors still blocks
// clickjacking and complements X-Frame-Options.
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "img-src 'self' data: blob: https:",
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com https://www.gstatic.com https://challenges.cloudflare.com",
      "frame-src 'self' https://www.google.com https://challenges.cloudflare.com",
      "font-src 'self' data:",
      "connect-src 'self' https://www.google.com https://challenges.cloudflare.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

module.exports = {
  output: "standalone",
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  // svg-captcha loads font files from disk at runtime — must not be bundled.
  serverExternalPackages: ["svg-captcha"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "isomorphic-furyroad.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "randomuser.me",
      },
    ],
  },
  transpilePackages: ["core", "rizzui", "@headlessui/react", "@floating-ui/react", "@floating-ui/react-dom", "@floating-ui/dom"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};
