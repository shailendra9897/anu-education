/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://www.anuedu.in",

  // Generate robots.txt automatically
  generateRobotsTxt: true,

  // Keep one sitemap for now (site still manageable)
  generateIndexSitemap: false,
  sitemapSize: 50000,

  // URL handling
  trailingSlash: false,

  // Exclude pages that should never be indexed
  exclude: [
    "/404",
    "/500",
    "/admin/*",
    "/api/*",
    "/thank-you",
    "/private/*",
  ],

  // robots.txt configuration
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],

    additionalSitemaps: [
      "https://www.anuedu.in/sitemap.xml",
    ],
  },

  // Better defaults
  changefreq: "weekly",

  // Global priority
  priority: 0.7,

  autoLastmod: true,

  // Transform priorities by route type
  transform: async (config, path) => {
    let priority = 0.7;
    let changefreq = "weekly";

    if (path === "/") {
      priority = 1.0;
      changefreq = "daily";
    }

    // Main categories
    if (
      path.startsWith("/study-in") ||
      path.startsWith("/test-prep") ||
      path.startsWith("/languages")
    ) {
      priority = 0.9;
    }

    // Germany ecosystem / tools
    if (
      path.includes("/germany") ||
      path.startsWith("/tools")
    ) {
      priority = 0.8;
    }

    // Blog/support pages
    if (
      path.startsWith("/blog") ||
      path.startsWith("/services")
    ) {
      priority = 0.6;
    }

    return {
      loc: path,
      changefreq,
      priority,
      lastmod: config.autoLastmod
        ? new Date().toISOString()
        : undefined,
    };
  },
};