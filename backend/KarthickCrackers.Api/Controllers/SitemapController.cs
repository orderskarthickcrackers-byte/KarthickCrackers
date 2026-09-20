using System;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using KarthickCrackers.Api.Data;
using System.Xml.Linq;
using System.Linq;

namespace KarthickCrackers.Api.Controllers
{
    [ApiController]
    public class SitemapController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly string _baseUrl = "https://www.karthickcrackers.in";

        public SitemapController(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet("/sitemap.xml")]
        [Produces("application/xml")]
        public async Task<IActionResult> GetSitemap()
        {
            var sitemap = new XDocument(new XDeclaration("1.0", "utf-8", "yes"));
            XNamespace ns = "http://www.sitemaps.org/schemas/sitemap/0.9";
            var urlset = new XElement(ns + "urlset");

            // Add static pages
            var staticPages = new[]
            {
                "", // home
                "/products",
                "/categories/all",
                "/crackers-price-list",
                "/quick-order",
                "/faq"
            };

            foreach (var page in staticPages)
            {
                urlset.Add(CreateUrlElement(ns, $"{_baseUrl}{page}", DateTime.UtcNow.ToString("yyyy-MM-dd"), "daily", "1.0"));
            }

            // Add categories
            var categories = await _dbContext.Categories.Where(c => c.IsActive).ToListAsync();
            foreach (var cat in categories)
            {
                var slug = string.IsNullOrWhiteSpace(cat.CategorySlug) ? cat.CategoryId.ToString() : cat.CategorySlug;
                urlset.Add(CreateUrlElement(ns, $"{_baseUrl}/categories/{slug}", DateTime.UtcNow.ToString("yyyy-MM-dd"), "weekly", "0.8"));
            }

            // Add products
            var products = await _dbContext.Products.Where(p => p.IsActive && p.IsAvailable).ToListAsync();
            foreach (var prod in products)
            {
                var slug = string.IsNullOrWhiteSpace(prod.ProductSlug) ? prod.ProductCode : prod.ProductSlug;
                urlset.Add(CreateUrlElement(ns, $"{_baseUrl}/products/{slug}", prod.ModifiedDate?.ToString("yyyy-MM-dd") ?? prod.CreatedDate.ToString("yyyy-MM-dd"), "weekly", "0.8"));
            }

            sitemap.Add(urlset);
            return Content(sitemap.ToString(), "application/xml", Encoding.UTF8);
        }

        [HttpGet("/robots.txt")]
        [Produces("text/plain")]
        public IActionResult GetRobotsTxt()
        {
            var robots = $@"User-agent: *
Disallow: /admin/
Disallow: /cart
Disallow: /checkout
Disallow: /confirmation
Disallow: /api/

Allow: /

Sitemap: {_baseUrl}/sitemap.xml";

            return Content(robots, "text/plain", Encoding.UTF8);
        }

        private XElement CreateUrlElement(XNamespace ns, string loc, string lastmod, string changefreq, string priority)
        {
            return new XElement(ns + "url",
                new XElement(ns + "loc", loc),
                new XElement(ns + "lastmod", lastmod),
                new XElement(ns + "changefreq", changefreq),
                new XElement(ns + "priority", priority)
            );
        }
    }
}
