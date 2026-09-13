const nextConfig = {
  outputFileTracingIncludes: {
    "/api/admin/admissions/[id]/actions/route": [
      "./node_modules/playwright-core/.local-browsers/**",
    ],
    "/api/admin/portal-access/[id]/action/route": [
      "./node_modules/playwright-core/.local-browsers/**",
    ],
  },
};

export default nextConfig;