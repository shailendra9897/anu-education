const nextConfig = {
  experimental: {
    outputFileTracingIncludes: {
      "/api/admin/admissions/*/actions": [
        "./node_modules/playwright-core/.local-browsers/chromium_headless_shell-*/**",
      ],
      "/api/admin/portal-access/*/action": [
        "./node_modules/playwright-core/.local-browsers/chromium_headless_shell-*/**",
      ],
    },
  },
};

export default nextConfig;