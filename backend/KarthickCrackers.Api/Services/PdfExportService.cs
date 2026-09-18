using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PuppeteerSharp;
using PuppeteerSharp.Media;
using KarthickCrackers.Api.Data;
using KarthickCrackers.Api.DTOs;
using KarthickCrackers.Api.Entities;

namespace KarthickCrackers.Api.Services
{
    public class PdfExportService : IPdfExportService
    {
        private readonly IProductService _productService;
        private readonly ApplicationDbContext _dbContext;
        private readonly ILogger<PdfExportService> _logger;

        public PdfExportService(IProductService productService, ApplicationDbContext dbContext, ILogger<PdfExportService> logger)
        {
            _productService = productService;
            _dbContext = dbContext;
            _logger = logger;
        }

        public async Task<byte[]> GeneratePriceListPdfAsync(int? categoryId = null)
        {
            _logger.LogInformation("Starting server-side Price List PDF generation...");

            // Fetch live customer products using existing product service & business rules
            // (IsActive = true, IsAvailable = true, TotalQuantity > 0)
            var products = await _productService.GetCustomerProductsAsync(null, categoryId);

            if (products == null || !products.Any())
            {
                if (categoryId.HasValue)
                {
                    _logger.LogWarning("No active products found for categoryId: {CategoryId}. Falling back to all products.", categoryId);
                    products = await _productService.GetCustomerProductsAsync(null, null);
                }
            }

            if (products == null || !products.Any())
            {
                throw new InvalidOperationException("No active products available to generate price list PDF.");
            }

            _logger.LogInformation("Fetched {Count} products for PDF generation.", products.Count);

            // Build dynamic HTML document
            string htmlContent = BuildPriceListHtml(products);

            // Execute HTML to PDF conversion using PuppeteerSharp
            string executablePath = await GetBrowserExecutablePathAsync();
            _logger.LogInformation("Using browser executable at: {Path}", executablePath);

            var launchOptions = new LaunchOptions
            {
                ExecutablePath = executablePath,
                Headless = true,
                Args = new[]
                {
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-dev-shm-usage",
                    "--disable-gpu"
                }
            };

            IBrowser? browser = null;
            IPage? page = null;

            try
            {
                browser = await Puppeteer.LaunchAsync(launchOptions);
                page = await browser.NewPageAsync();

                await page.SetContentAsync(htmlContent, new SetContentOptions
                {
                    WaitUntil = new[] { WaitUntilNavigation.DOMContentLoaded }
                });

                var pdfOptions = new PdfOptions
                {
                    Format = PaperFormat.A4,
                    PrintBackground = true,
                    PreferCSSPageSize = true,
                    MarginOptions = new MarginOptions
                    {
                        Top = "8mm",
                        Bottom = "8mm",
                        Left = "10mm",
                        Right = "10mm"
                    }
                };

                byte[] pdfBytes = await page.PdfDataAsync(pdfOptions);
                _logger.LogInformation("Successfully generated Price List PDF. Output size: {Size} bytes.", pdfBytes.Length);

                return pdfBytes;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to convert HTML template to PDF via PuppeteerSharp.");
                throw;
            }
            finally
            {
                if (page != null)
                {
                    await page.CloseAsync();
                }
                if (browser != null)
                {
                    await browser.CloseAsync();
                }
            }
        }

        private async Task<string> GetBrowserExecutablePathAsync()
        {
            // Check Environment Variable
            string? envPath = Environment.GetEnvironmentVariable("PUPPETEER_EXECUTABLE_PATH");
            if (!string.IsNullOrEmpty(envPath) && File.Exists(envPath)) return envPath;

            // Check installed Linux Chromium / Chrome
            if (File.Exists("/usr/bin/chromium")) return "/usr/bin/chromium";
            if (File.Exists("/usr/bin/chromium-browser")) return "/usr/bin/chromium-browser";
            if (File.Exists("/usr/bin/google-chrome")) return "/usr/bin/google-chrome";

            // Check installed Windows Edge
            string edgePath = @"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe";
            if (File.Exists(edgePath)) return edgePath;

            // Check installed Windows Chrome
            string chromePath = @"C:\Program Files\Google\Chrome\Application\chrome.exe";
            if (File.Exists(chromePath)) return chromePath;

            _logger.LogInformation("Edge/Chrome not found at default locations. Downloading Chromium via BrowserFetcher...");
            var browserFetcher = new BrowserFetcher();
            var downloadResult = await browserFetcher.DownloadAsync();
            return downloadResult.GetExecutablePath();
        }

        private static string BuildPriceListHtml(List<ProductDto> products)
        {
            // Group products by Category Name maintaining insertion / ID order
            var categoryMap = new List<(string CategoryName, List<ProductDto> Products)>();

            foreach (var p in products)
            {
                string catName = string.IsNullOrWhiteSpace(p.CategoryName) ? "GENERAL" : p.CategoryName.Trim();
                var existingGroup = categoryMap.FirstOrDefault(c => string.Equals(c.CategoryName, catName, StringComparison.OrdinalIgnoreCase));
                if (existingGroup.CategoryName != null)
                {
                    existingGroup.Products.Add(p);
                }
                else
                {
                    categoryMap.Add((catName, new List<ProductDto> { p }));
                }
            }

            var categoryColors = new[]
            {
                "#8B0000", "#006400", "#1B4F72", "#6C3483", "#7D6608",
                "#78281F", "#117864", "#4A235A", "#7E5109"
            };

            // Build Category Quick Summary Cards HTML
            var summaryCardsSb = new StringBuilder();
            foreach (var (catName, prods) in categoryMap)
            {
                decimal minPrice = prods.Min(p => p.DiscountPrice > 0 ? p.DiscountPrice : p.Price);
                summaryCardsSb.Append($@"
                    <div class=""summary-card"">
                        <div class=""sc-title"">{WebUtilityHtmlEncode(catName)}</div>
                        <div class=""sc-sub""><span>{prods.Count} Items</span> <b>From ₹{minPrice:F0}</b></div>
                    </div>
                ");
            }

            // Build Category Tables HTML
            int globalItemNum = 1;
            var categoryTablesSb = new StringBuilder();

            for (int catIdx = 0; catIdx < categoryMap.Count; catIdx++)
            {
                var (catName, prods) = categoryMap[catIdx];
                string color = categoryColors[catIdx % categoryColors.Length];

                var rowsSb = new StringBuilder();
                foreach (var p in prods)
                {
                    int itemIndex = globalItemNum++;
                    decimal mrpVal = p.MRPPrice > 0 ? p.MRPPrice : (p.Price * 2.22m);
                    decimal offerVal = p.DiscountPrice > 0 ? p.DiscountPrice : p.Price;
                    string unitStr = string.IsNullOrWhiteSpace(p.Unit) ? "1 Box" : p.Unit;

                    rowsSb.Append($@"
                        <tr>
                            <td class=""col-num"">{itemIndex}</td>
                            <td class=""col-desc"">
                                <div class=""prod-name"">{WebUtilityHtmlEncode(p.ProductName)}</div>
                                <div class=""prod-code"">{WebUtilityHtmlEncode(p.ProductCode)}</div>
                            </td>
                            <td class=""col-unit"">{WebUtilityHtmlEncode(unitStr)}</td>
                            <td class=""col-mrp"">₹{mrpVal:F2}</td>
                            <td class=""col-offer"">₹{offerVal:F2}</td>
                            <td class=""col-box""></td>
                            <td class=""col-box""></td>
                        </tr>
                    ");
                }

                categoryTablesSb.Append($@"
                    <div class=""category-block"">
                        <div class=""category-header"" style=""background-color: {color};"">
                            <span>{catIdx + 1}. {WebUtilityHtmlEncode(catName.ToUpper())}</span>
                            <span class=""cat-badge"">{prods.Count} Products</span>
                        </div>
                        <table class=""price-table"">
                            <thead>
                                <tr>
                                    <th style=""width: 35px; text-align: center;"">#</th>
                                    <th style=""text-align: left;"">PRODUCT DESCRIPTION</th>
                                    <th style=""width: 130px; text-align: center;"">PACKING / UNIT</th>
                                    <th style=""width: 85px; text-align: right;"">MRP (₹)</th>
                                    <th style=""width: 95px; text-align: right;"">OFFER (₹)</th>
                                    <th style=""width: 55px; text-align: center;"">QTY</th>
                                    <th style=""width: 85px; text-align: right;"">AMOUNT (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rowsSb}
                            </tbody>
                        </table>
                    </div>
                ");
            }

            return $@"<!DOCTYPE html>
<html>
<head>
    <meta charset=""utf-8"">
    <title>Karthick Crackers Price List 2026</title>
    <style>
        @page {{
            size: A4 portrait;
            margin: 8mm 10mm 8mm 10mm;
        }}
        * {{ box-sizing: border-box; margin: 0; padding: 0; }}
        body {{
            font-family: -apple-system, BlinkMacSystemFont, ""Segoe UI"", Roboto, Helvetica, Arial, sans-serif;
            background: #ffffff;
            color: #1e272e;
            line-height: 1.35;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }}

        .pdf-wrap {{
            width: 100%;
            margin: 0 auto;
            background: #ffffff;
        }}

        .pdf-section-block {{
            background: #ffffff;
            margin-bottom: 14px;
        }}

        /* HEADER BANNER */
        .header-banner {{
            background: #090806 !important;
            color: #ffffff !important;
            border-radius: 10px;
            padding: 20px 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border: 2px solid #E5A93C;
        }}

        .brand-title-box h1 {{
            font-size: 28px;
            font-weight: 900;
            letter-spacing: -0.5px;
            color: #ffffff;
            line-height: 1.1;
        }}

        .brand-title-box p {{
            font-size: 10.5px;
            color: #E5A93C;
            letter-spacing: 2px;
            font-weight: 700;
            margin-top: 4px;
            text-transform: uppercase;
        }}

        .address-box {{
            text-align: right;
            font-size: 11px;
            color: #cbd5e0;
            line-height: 1.35;
        }}

        .address-box strong {{
            color: #F5C242;
            display: block;
            font-size: 11.5px;
            letter-spacing: 1px;
            margin-bottom: 2px;
        }}

        /* SUBHEADER */
        .subheader {{
            text-align: center;
            padding: 8px 0;
        }}
        .subheader p.eyebrow {{
            font-size: 11px;
            font-weight: 800;
            color: #c53030;
            letter-spacing: 2px;
            text-transform: uppercase;
            margin-bottom: 4px;
        }}
        .subheader h1 {{
            font-size: 26px;
            font-weight: 900;
            color: #0b132b;
            margin-bottom: 4px;
        }}
        .subheader p.subtext {{
            font-size: 11.5px;
            color: #4a5568;
            max-width: 650px;
            margin: 0 auto;
        }}

        /* OFFER STRIP */
        .offer-strip {{
            background: #c53030 !important;
            color: #ffffff !important;
            padding: 12px 20px;
            border-radius: 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }}
        .offer-main {{ font-size: 17px; letter-spacing: 0.5px; font-weight: 900; }}
        .offer-sub {{ font-size: 11.5px; opacity: 0.95; font-weight: 600; }}

        /* STATS GRID */
        .stats-grid {{
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
        }}
        .stat-box {{
            background: #f7fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 10px;
            text-align: center;
        }}
        .stat-val {{ font-size: 20px; font-weight: 900; color: #1a202c; }}
        .stat-lbl {{ font-size: 9.5px; font-weight: 800; color: #718096; letter-spacing: 1px; margin-top: 2px; }}

        /* QUICK SUMMARY */
        .summary-section-head {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
            font-size: 11.5px;
            font-weight: 800;
            letter-spacing: 1px;
            color: #2d3748;
        }}
        .summary-grid {{
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 8px;
        }}
        .summary-card {{
            background: #ffffff;
            border: 1.5px solid #e2e8f0;
            border-radius: 6px;
            padding: 7px 9px;
        }}
        .sc-title {{ font-size: 11px; font-weight: 800; color: #1a202c; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }}
        .sc-sub {{ font-size: 10px; color: #718096; margin-top: 2px; display: flex; justify-content: space-between; }}
        .sc-sub b {{ color: #e53e3e; }}

        /* CATEGORY TABLES */
        .category-block {{
            page-break-inside: avoid;
            break-inside: avoid;
            margin-bottom: 14px;
        }}
        .category-header {{
            padding: 9px 12px;
            color: #ffffff !important;
            font-weight: 800;
            font-size: 13px;
            border-top-left-radius: 6px;
            border-top-right-radius: 6px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            letter-spacing: 0.5px;
        }}
        .cat-badge {{
            background: rgba(255,255,255,0.25);
            padding: 2px 7px;
            border-radius: 10px;
            font-size: 10.5px;
        }}

        .price-table {{
            width: 100%;
            border-collapse: collapse;
            background: #ffffff;
            border: 1px solid #cbd5e0;
            border-bottom-left-radius: 6px;
            border-bottom-right-radius: 6px;
            font-size: 11.5px;
            page-break-inside: auto;
        }}
        .price-table thead {{
            display: table-header-group;
        }}
        .price-table tr {{
            page-break-inside: avoid;
            break-inside: avoid;
        }}
        .price-table th {{
            background: #1a202c !important;
            color: #ffffff !important;
            padding: 7px 9px;
            font-size: 10px;
            font-weight: 800;
            letter-spacing: 0.5px;
            border: 1px solid #2d3748;
        }}
        .price-table td {{
            padding: 7px 9px;
            border-bottom: 1px solid #edf2f7;
            border-right: 1px solid #edf2f7;
            vertical-align: middle;
        }}
        .price-table tr:nth-child(even) td {{
            background: #f7fafc;
        }}
        .col-num {{ text-align: center; color: #718096; font-weight: 700; width: 35px; }}
        .col-desc {{ }}
        .prod-name {{ font-weight: 700; color: #2d3748; font-size: 12px; }}
        .prod-code {{ font-size: 9.5px; color: #a0aec0; font-family: monospace; }}
        .col-unit {{ text-align: center; color: #4a5568; width: 130px; }}
        .col-mrp {{ text-align: right; color: #718096; text-decoration: line-through; width: 85px; }}
        .col-offer {{ text-align: right; color: #e53e3e; font-weight: 800; font-size: 12px; width: 95px; }}
        .col-box {{ width: 55px; border: 1px dashed #cbd5e0 !important; background: #ffffff !important; }}

        /* GIFT BANNER */
        .gift-banner {{
            background: #d69e2e !important;
            color: #744210 !important;
            font-weight: 900;
            font-size: 14px;
            text-align: center;
            padding: 12px;
            border-radius: 6px;
            letter-spacing: 0.5px;
            page-break-inside: avoid;
            break-inside: avoid;
        }}

        /* NOTES & FOOTER */
        .notes-box {{
            background: #fffaf0;
            border: 1px solid #feebc8;
            border-radius: 6px;
            padding: 14px;
            page-break-inside: avoid;
            break-inside: avoid;
        }}
        .notes-box h4 {{ color: #9c4221; font-size: 12.5px; margin-bottom: 6px; font-weight: 800; }}
        .notes-box ul {{ padding-left: 16px; font-size: 11px; color: #7b341e; line-height: 1.45; }}

        .footer-bar {{
            border-top: 2px solid #e2e8f0;
            padding-top: 12px;
            display: flex;
            justify-content: space-between;
            font-size: 10.5px;
            color: #718096;
            page-break-inside: avoid;
            break-inside: avoid;
        }}
    </style>
</head>
<body>
    <div class=""pdf-wrap"">
        <!-- HEADER BANNER -->
        <div class=""pdf-section-block header-banner"">
            <div class=""brand-title-box"">
                <h1>Karthick Crackers</h1>
                <p>LIGHT UP THE CELEBRATION · WHOLESALE & RETAIL</p>
            </div>
            <div class=""address-box"">
                <strong>ADDRESS</strong>
                3/347/U, Inthira Group House,<br>
                Maraneri Village, Sivakasi - 626124
            </div>
        </div>

        <!-- SUBHEADER -->
        <div class=""pdf-section-block subheader"">
            <p class=""eyebrow"">DIRECT FROM SIVAKASI FACTORY OUTLET</p>
            <h1>Diwali 2026 Official Price List</h1>
            <p class=""subtext"">Buy original, high-quality Sivakasi crackers directly from our factory at lowest prices. Safe, fresh stock with mega discount for this Diwali celebration!</p>
        </div>

        <!-- OFFER STRIP -->
        <div class=""pdf-section-block offer-strip"">
            <span class=""offer-main"">Flat 55% OFF on All Crackers!</span>
            <span class=""offer-sub"">Special Festive Offer · Direct Sivakasi Factory Pricing</span>
        </div>

        <!-- STATS GRID -->
        <div class=""pdf-section-block stats-grid"">
            <div class=""stat-box"">
                <div class=""stat-val"">{products.Count}</div>
                <div class=""stat-lbl"">TOTAL ITEMS</div>
            </div>
            <div class=""stat-box"">
                <div class=""stat-val"">Flat 55%</div>
                <div class=""stat-lbl"">MEGA DISCOUNT</div>
            </div>
            <div class=""stat-box"">
                <div class=""stat-val"">Diwali 2026</div>
                <div class=""stat-lbl"">SEASON OFFER</div>
            </div>
            <div class=""stat-box"">
                <div class=""stat-val"">Factory Price</div>
                <div class=""stat-lbl"">DIRECT SIVAKASI</div>
            </div>
        </div>

        <!-- QUICK SUMMARY CARDS -->
        <div class=""pdf-section-block"">
            <div class=""summary-section-head"">
                <span>PRODUCT CATEGORIES · QUICK SUMMARY</span>
                <span style=""font-size: 10.5px; color: #718096;"">Detailed price list below ↓</span>
            </div>
            <div class=""summary-grid"">
                {summaryCardsSb}
            </div>
        </div>

        <!-- DETAILED CATEGORY TABLES -->
        {categoryTablesSb}

        <!-- GIFT BOX BANNER -->
        <div class=""pdf-section-block gift-banner"">
            🎁 All Kinds of Diwali Gift Boxes & Family Packs Available!
        </div>

        <!-- ORDER & SAFETY NOTES -->
        <div class=""pdf-section-block notes-box"">
            <h4>Order & Safety Notes</h4>
            <ul>
                <li>All prices listed are per box / piece as specified in the Variant column and are inclusive of applicable taxes.</li>
                <li>Prices and stock are subject to change without prior notice during peak festive demand — please confirm live pricing on our website.</li>
                <li>All products are manufactured in Sivakasi following strict quality and safety standards.</li>
                <li>Minors and children should use crackers only under adult supervision, in open outdoor spaces.</li>
                <li>Delivery is available across Tamil Nadu with direct Sivakasi factory-outlet pricing and express shipping options.</li>
            </ul>
        </div>

        <!-- FOOTER BAR -->
        <div class=""pdf-section-block footer-bar"">
            <span><strong>Karthick Crackers</strong> · Sivakasi, Tamil Nadu</span>
            <span>Official Price List 2026</span>
        </div>
    </div>
</body>
</html>";
        }

        public async Task<byte[]> GenerateOrderInvoicePdfAsync(int orderId)
        {
            var order = await _dbContext.Orders
                .Include(o => o.OrderItems)
                    .ThenInclude(i => i.Product)
                .FirstOrDefaultAsync(o => o.OrderId == orderId);

            if (order == null)
            {
                throw new InvalidOperationException($"Order ID {orderId} not found.");
            }

            var customer = await _dbContext.Customers.FirstOrDefaultAsync(c => c.CustomerId == order.CustomerId);
            return await GenerateInvoicePdfInternalAsync(order, customer);
        }

        public async Task<byte[]> GenerateOrderInvoicePdfByNumberAsync(string orderNumber)
        {
            var order = await _dbContext.Orders
                .Include(o => o.OrderItems)
                    .ThenInclude(i => i.Product)
                .FirstOrDefaultAsync(o => o.OrderNumber == orderNumber);

            if (order == null)
            {
                throw new InvalidOperationException($"Order #{orderNumber} not found.");
            }

            var customer = await _dbContext.Customers.FirstOrDefaultAsync(c => c.CustomerId == order.CustomerId);
            return await GenerateInvoicePdfInternalAsync(order, customer);
        }

        private async Task<byte[]> GenerateInvoicePdfInternalAsync(Order order, Customer? customer)
        {
            _logger.LogInformation("Generating Invoice PDF for Order #{OrderNumber}", order.OrderNumber);

            var browserFetcher = new BrowserFetcher();
            await browserFetcher.DownloadAsync();

            await using var browser = await Puppeteer.LaunchAsync(new LaunchOptions
            {
                Headless = true,
                Args = new[] { "--no-sandbox", "--disable-setuid-sandbox" }
            });

            await using var page = await browser.NewPageAsync();
            var paymentSetting = await _dbContext.PaymentSettings.FirstOrDefaultAsync();
            var callNumber = paymentSetting?.CallNumber ?? "+91 6380891094";
            var upiId = paymentSetting?.UpiId ?? "9952378965@upi";

            string htmlContent = BuildOrderInvoiceHtml(order, customer, callNumber, upiId);

            await page.SetContentAsync(htmlContent);

            var pdfOptions = new PdfOptions
            {
                Format = PaperFormat.A4,
                PrintBackground = true,
                MarginOptions = new MarginOptions
                {
                    Top = "12mm",
                    Bottom = "12mm",
                    Left = "12mm",
                    Right = "12mm"
                }
            };

            byte[] pdfBytes = await page.PdfDataAsync(pdfOptions);
            _logger.LogInformation("Successfully generated Invoice PDF for Order #{OrderNumber} ({Size} bytes)", order.OrderNumber, pdfBytes.Length);
            return pdfBytes;
        }

        private static string BuildOrderInvoiceHtml(Order order, Customer? customer, string callNumber, string upiId)
        {
            var items = order.OrderItems ?? new List<OrderItem>();

            var itemRowsSb = new StringBuilder();
            int index = 1;

            foreach (var item in items)
            {
                var prodCode = WebUtilityHtmlEncode(item.Product?.ProductCode ?? item.ProductCode);
                var prodName = WebUtilityHtmlEncode(item.Product?.ProductName ?? "Firework Item");
                var unitPrice = item.UnitPrice.ToString("N2");
                var lineTotal = item.TotalPrice.ToString("N2");

                itemRowsSb.Append($@"
                <tr>
                    <td style=""text-align: center; font-weight: bold;"">{index++}</td>
                    <td style=""font-family: monospace; font-weight: bold; color: #B8860B;"">{prodCode}</td>
                    <td style=""font-weight: 600;"">{prodName}</td>
                    <td style=""text-align: center; font-weight: bold;"">{item.Quantity}</td>
                    <td style=""text-align: right;"">₹{unitPrice}</td>
                    <td style=""text-align: right; font-weight: bold; color: #000;"">₹{lineTotal}</td>
                </tr>");
            }

            var orderDateStr = order.OrderDate.ToString("dd MMM yyyy, hh:mm tt");
            var custNameStr = WebUtilityHtmlEncode(customer?.FullName ?? "Valued Customer");
            var mobileStr = WebUtilityHtmlEncode(customer?.MobileNumber ?? "N/A");
            var addressStr = WebUtilityHtmlEncode(customer?.Address ?? "N/A");
            var cityPincodeStr = WebUtilityHtmlEncode($"{(customer?.City ?? "")} - {(customer?.Pincode ?? "")}");

            var subtotalStr = order.Subtotal.ToString("N2");
            var deliveryStr = order.DeliveryCharge > 0 ? $"₹{order.DeliveryCharge:N2}" : "As Applicable / Transport";
            var netTotalStr = order.TotalAmount.ToString("N2");

            return $@"<!DOCTYPE html>
<html>
<head>
    <meta charset=""utf-8"">
    <title>Invoice - {order.OrderNumber}</title>
    <style>
        body {{
            font-family: 'Helvetica Neue', Arial, sans-serif;
            color: #1A1A1A;
            background: #FFFFFF;
            margin: 0;
            padding: 20px;
            font-size: 13px;
        }}
        .invoice-card {{
            border: 2px solid #E5A93C;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }}
        .invoice-header {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #F5C242;
            padding-bottom: 16px;
            margin-bottom: 20px;
        }}
        .brand-title {{
            font-size: 24px;
            font-weight: 900;
            color: #B8860B;
            letter-spacing: 1px;
            margin: 0;
        }}
        .brand-sub {{
            font-size: 11px;
            font-weight: 700;
            color: #555;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-top: 2px;
        }}
        .doc-badge {{
            text-align: right;
            background: #B8860B;
            color: #FFF;
            padding: 8px 16px;
            border-radius: 6px;
        }}
        .doc-badge h2 {{
            margin: 0;
            font-size: 16px;
            letter-spacing: 1px;
        }}
        .doc-badge p {{
            margin: 2px 0 0 0;
            font-size: 11px;
            color: #FFF;
        }}
        .details-grid {{
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 24px;
            background: #FAF8F5;
            padding: 16px;
            border-radius: 8px;
            border: 1px solid #EAE5D9;
        }}
        .details-box h4 {{
            margin: 0 0 8px 0;
            color: #B8860B;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }}
        .details-box p {{
            margin: 3px 0;
            font-size: 12.5px;
            color: #333;
        }}
        .items-table {{
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }}
        .items-table th {{
            background: #F5C242;
            color: #000;
            font-weight: 800;
            padding: 8px 10px;
            text-align: left;
            font-size: 12px;
        }}
        .items-table td {{
            padding: 8px 10px;
            border-bottom: 1px solid #EEE;
            font-size: 12.5px;
        }}
        .items-table tr:nth-child(even) {{
            background: #FDFCF9;
        }}
        .summary-box {{
            display: flex;
            justify-content: flex-end;
            margin-bottom: 24px;
        }}
        .summary-table {{
            width: 280px;
            border-collapse: collapse;
        }}
        .summary-table td {{
            padding: 6px 12px;
            font-size: 13px;
        }}
        .summary-table .total-row td {{
            border-top: 2px solid #B8860B;
            font-size: 16px;
            font-weight: 900;
            color: #B8860B;
            padding-top: 10px;
        }}
        .policy-banner {{
            background: #FFF5F5;
            border: 1.5px solid #E53E3E;
            border-radius: 8px;
            padding: 14px 18px;
            margin-bottom: 20px;
            color: #9B2C2C;
        }}
        .policy-banner h4 {{
            margin: 0 0 4px 0;
            font-size: 14px;
            color: #C53030;
        }}
        .policy-banner p {{
            margin: 0;
            font-size: 12.5px;
            line-height: 1.4;
        }}
        .footer-note {{
            text-align: center;
            font-size: 11px;
            color: #777;
            border-top: 1px solid #DDD;
            padding-top: 12px;
        }}
    </style>
</head>
<body>
    <div class=""invoice-card"">
        <!-- HEADER -->
        <div class=""invoice-header"">
            <div>
                <h1 class=""brand-title"">KARTHICK CRACKERS</h1>
                <div class=""brand-sub"">SIVAKASI DIRECT FACTORY OUTLET · SINCE 2010</div>
                <div style=""font-size: 11px; color: #666; margin-top: 4px;"">
                    3/347/U, Inthira Group House, Maraneri Village, Sivakasi - 626124<br>
                    Phone: {callNumber} · Email: orders.karthick.crackers@gmail.com
                </div>
            </div>
            <div class=""doc-badge"">
                <h2>ORDER INVOICE</h2>
                <p><strong>{order.OrderNumber}</strong></p>
                <p>{orderDateStr}</p>
            </div>
        </div>

        <!-- DETAILS GRID -->
        <div class=""details-grid"">
            <div class=""details-box"">
                <h4>Customer Details</h4>
                <p><strong>Name:</strong> {custNameStr}</p>
                <p><strong>Mobile:</strong> {mobileStr}</p>
                <p><strong>Address:</strong> {addressStr}</p>
                <p><strong>City / Pincode:</strong> {cityPincodeStr}</p>
            </div>
            <div class=""details-box"">
                <h4>Order Summary</h4>
                <p><strong>Order ID:</strong> #{order.OrderId}</p>
                <p><strong>Order Number:</strong> {order.OrderNumber}</p>
                <p><strong>Order Status:</strong> {order.OrderStatus}</p>
                <p><strong>Payment Status:</strong> {order.PaymentStatus}</p>
            </div>
        </div>

        <!-- ITEMS TABLE -->
        <table class=""items-table"">
            <thead>
                <tr>
                    <th style=""width: 8%; text-align: center;"">#</th>
                    <th style=""width: 15%;"">Code</th>
                    <th style=""width: 45%;"">Product Name</th>
                    <th style=""width: 10%; text-align: center;"">Qty</th>
                    <th style=""width: 11%; text-align: right;"">Price</th>
                    <th style=""width: 11%; text-align: right;"">Total</th>
                </tr>
            </thead>
            <tbody>
                {itemRowsSb}
            </tbody>
        </table>

        <!-- FINANCIAL SUMMARY -->
        <div class=""summary-box"">
            <table class=""summary-table"">
                <tr>
                    <td>Subtotal:</td>
                    <td style=""text-align: right; font-weight: bold;"">₹{subtotalStr}</td>
                </tr>
                <tr>
                    <td>Delivery Charge:</td>
                    <td style=""text-align: right;"">{deliveryStr}</td>
                </tr>
                <tr class=""total-row"">
                    <td>TOTAL AMOUNT:</td>
                    <td style=""text-align: right;"">₹{netTotalStr}</td>
                </tr>
            </table>
        </div>

        <!-- PAYMENT POLICY WARNING BANNER -->
        <div class=""policy-banner"">
            <h4>💳 PAYMENT POLICY: STRICTLY UPI PAYMENTS ONLY</h4>
            <p>
                Please note that <strong>NO Cash On Delivery (COD)</strong> is accepted for cracker dispatches. 
                Kindly complete your payment via UPI (GPay / PhonePe / PayTM / BHIM) to <strong>{upiId}</strong> (or Call {callNumber}). 
                Share your payment screenshot on WhatsApp to dispatch your order immediately.
            </p>
        </div>

        <!-- FOOTER -->
        <div class=""footer-note"">
            Thank you for buying directly from Karthick Crackers Sivakasi Factory Outlet! Wish you a safe & sparkling Diwali!
        </div>
    </div>
</body>
</html>";
        }

        private static string WebUtilityHtmlEncode(string value)
        {
            return System.Net.WebUtility.HtmlEncode(value ?? string.Empty);
        }
    }
}
