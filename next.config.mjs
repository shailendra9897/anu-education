const nextConfig = {
  experimental: {
    outputFileTracingIncludes: {
      "/api/admin/admissions/*/actions": [
        "./node_modules/playwright-core/.local-browsers/**",
      ],
      "/api/admin/portal-access/*/action": [
        "./node_modules/playwright-core/.local-browsers/**",
      ],
    },
  },
};

export default nextConfig;