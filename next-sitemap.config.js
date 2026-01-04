/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.anuedu.in',
  generateRobotsTxt: true,

  // 🔴 FORCE SINGLE SITEMAP
  generateIndexSitemap: false,
  sitemapSize: 50000,
  trailingSlash: false,
};