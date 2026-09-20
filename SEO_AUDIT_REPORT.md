# Karthick Crackers - SEO Audit & Action Plan

## Current SEO Problems

1. **Client-Side Rendering (CSR) Only:**
   - *Problem:* Angular 22 is used without SSR (`@angular/ssr` is missing).
   - *Why it matters:* Search engines (especially Bing and older bots) struggle to index JavaScript-rendered content. Social media crawlers (Facebook, Twitter) cannot read meta tags injected via JS.
2. **Poor URL Structure:**
   - *Problem:* Product URLs use `detail/:code` (e.g., `/detail/KHC-1002`). Categories use `/category/:id`.
   - *Why it matters:* URLs lack keywords. Search engines cannot infer context from "detail/KHC-1002".
3. **Missing Unique Meta Data:**
   - *Problem:* No dynamic Title, Meta Description, or Open Graph tags. Every page shares the default `index.html` title.
   - *Why it matters:* Results in low click-through rates (CTR) and poor ranking for specific product keywords.
4. **No Canonical URLs:**
   - *Problem:* Canonical links are not injected.
   - *Why it matters:* Duplicate content issues arise if URLs have query parameters (e.g., sort/filter).
5. **No Structured Data (JSON-LD):**
   - *Problem:* Missing Schema.org markup for Products, LocalBusiness, and Breadcrumbs.
   - *Why it matters:* Missed opportunity for Rich Snippets (price, availability, reviews) in Google Search.
6. **Missing XML Sitemap & robots.txt Configuration:**
   - *Problem:* No dynamic `sitemap.xml` listing all products/categories. `robots.txt` is basic/missing.
   - *Why it matters:* Google indexing is slow and incomplete.
7. **Missing Dedicated Price List Page:**
   - *Problem:* Price list is just a PDF download triggered via an API, not an HTML page.
   - *Why it matters:* "Sivakasi crackers price list" is a massive keyword that is currently unoptimized.

## Planned Changes

1. **Angular SEO Optimization:** 
   - Since SSR cannot be safely dropped into a complex app without extensive regression testing, I will implement a robust `SeoService` to inject `<title>`, `<meta>`, `<link rel="canonical">`, and JSON-LD dynamically. 
2. **URL Structure (Slugs):**
   - Add `ProductSlug` and `CategorySlug` to the backend database.
   - Change frontend routes: `/products/:slug` and `/categories/:slug`.
   - Implement redirects for old `/detail/:code` routes.
3. **Structured Data:**
   - Add valid Product Schema, Organization Schema, and Breadcrumb Schema via `SeoService`.
4. **Backend SEO APIs:**
   - Add a `/sitemap.xml` endpoint in ASP.NET Core to generate an XML sitemap of all products, categories, and static pages dynamically.
5. **Dedicated SEO Pages:**
   - Create `/crackers-price-list` component with an HTML table format.
   - Create `/faq` component.
   - Create a proper `/404` component returning correct status headers where possible.
6. **Image Optimization:**
   - Add `alt` tags to all product and category images dynamically.

*Implementation will proceed incrementally, preserving all existing business logic.*
