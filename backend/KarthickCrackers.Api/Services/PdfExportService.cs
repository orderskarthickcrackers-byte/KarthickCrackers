using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using KarthickCrackers.Api.Data;
using KarthickCrackers.Api.DTOs;
using KarthickCrackers.Api.Entities;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace KarthickCrackers.Api.Services
{
    public class PdfExportService : IPdfExportService
    {
        private readonly IProductService _productService;
        private readonly ApplicationDbContext _dbContext;
        private readonly ILogger<PdfExportService> _logger;

        static PdfExportService()
        {
            QuestPDF.Settings.License = LicenseType.Community;
        }

        public PdfExportService(IProductService productService, ApplicationDbContext dbContext, ILogger<PdfExportService> logger)
        {
            _productService = productService;
            _dbContext = dbContext;
            _logger = logger;
        }

        public async Task<byte[]> GeneratePriceListPdfAsync(int? categoryId = null)
        {
            _logger.LogInformation("Starting QuestPDF Price List PDF generation for categoryId: {CategoryId}...", categoryId);

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

            // Group products by Category
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

            byte[] pdfBytes = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(15, Unit.Point);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(9).FontColor("#1E272E").FontFamily("Arial"));

                    // HEADER
                    page.Header().Column(col =>
                    {
                        col.Item().Background("#090806").Border(1.5f).BorderColor("#E5A93C").Padding(10).Row(row =>
                        {
                            row.RelativeItem().Column(c =>
                            {
                                c.Item().Text("Karthick Crackers").FontSize(18).Bold().FontColor(Colors.White);
                                c.Item().Text("LIGHT UP THE CELEBRATION · WHOLESALE & RETAIL").FontSize(8).Bold().FontColor("#E5A93C");
                            });

                            row.ConstantItem(200).AlignRight().Column(c =>
                            {
                                c.Item().Text("FACTORY OUTLET ADDRESS").FontSize(8).Bold().FontColor("#F5C242");
                                c.Item().Text("3/347/U, Inthira Group House,").FontSize(8).FontColor("#CBD5E0");
                                c.Item().Text("Maraneri Village, Sivakasi - 626124").FontSize(8).FontColor("#CBD5E0");
                            });
                        });

                        col.Item().PaddingTop(6).AlignCenter().Column(c =>
                        {
                            c.Item().Text("DIRECT FROM SIVAKASI FACTORY OUTLET").FontSize(8).Bold().FontColor("#C53030");
                            c.Item().Text("Diwali 2026 Official Price List").FontSize(15).Bold().FontColor("#0B132B");
                        });

                        col.Item().PaddingTop(4).Background("#C53030").Padding(6).Row(row =>
                        {
                            row.RelativeItem().Text("Flat 55% OFF on All Crackers!").FontSize(10).Bold().FontColor(Colors.White);
                            row.AutoItem().Text("Special Festive Offer · Direct Sivakasi Factory Pricing").FontSize(8).FontColor(Colors.White);
                        });
                    });

                    // CONTENT
                    page.Content().PaddingTop(8).Column(col =>
                    {
                        int globalItemNum = 1;

                        for (int catIdx = 0; catIdx < categoryMap.Count; catIdx++)
                        {
                            var (catName, prods) = categoryMap[catIdx];
                            string headerColorHex = categoryColors[catIdx % categoryColors.Length];

                            col.Item().PaddingTop(8).EnsureSpace().Column(catCol =>
                            {
                                // Category Bar
                                catCol.Item().Background(headerColorHex).Padding(5).Row(r =>
                                {
                                    r.RelativeItem().Text($"{catIdx + 1}. {catName.ToUpper()}").FontSize(10).Bold().FontColor(Colors.White);
                                    r.AutoItem().Text($"{prods.Count} Products").FontSize(8).FontColor(Colors.White);
                                });

                                // Products Table
                                catCol.Item().Table(table =>
                                {
                                    table.ColumnsDefinition(columns =>
                                    {
                                        columns.ConstantColumn(25);  // #
                                        columns.RelativeColumn(1);   // Product Name & Code
                                        columns.ConstantColumn(75);  // Unit
                                        columns.ConstantColumn(55);  // MRP
                                        columns.ConstantColumn(60);  // Offer Price
                                        columns.ConstantColumn(35);  // QTY
                                        columns.ConstantColumn(60);  // Amount
                                    });

                                    // Table Header
                                    table.Header(header =>
                                    {
                                        header.Cell().Background("#1A202C").Padding(3).AlignCenter().Text("#").FontSize(7.5f).Bold().FontColor(Colors.White);
                                        header.Cell().Background("#1A202C").Padding(3).Text("PRODUCT DESCRIPTION").FontSize(7.5f).Bold().FontColor(Colors.White);
                                        header.Cell().Background("#1A202C").Padding(3).AlignCenter().Text("UNIT").FontSize(7.5f).Bold().FontColor(Colors.White);
                                        header.Cell().Background("#1A202C").Padding(3).AlignRight().Text("MRP (₹)").FontSize(7.5f).Bold().FontColor(Colors.White);
                                        header.Cell().Background("#1A202C").Padding(3).AlignRight().Text("OFFER (₹)").FontSize(7.5f).Bold().FontColor(Colors.White);
                                        header.Cell().Background("#1A202C").Padding(3).AlignCenter().Text("QTY").FontSize(7.5f).Bold().FontColor(Colors.White);
                                        header.Cell().Background("#1A202C").Padding(3).AlignRight().Text("AMOUNT").FontSize(7.5f).Bold().FontColor(Colors.White);
                                    });

                                    foreach (var p in prods)
                                    {
                                        int itemIndex = globalItemNum++;
                                        decimal mrpVal = p.MRPPrice > 0 ? p.MRPPrice : (p.Price * 2.22m);
                                        decimal offerVal = p.DiscountPrice > 0 ? p.DiscountPrice : p.Price;
                                        string unitStr = string.IsNullOrWhiteSpace(p.Unit) ? "1 Box" : p.Unit;

                                        string bg = (itemIndex % 2 == 0) ? "#F7FAFC" : "#FFFFFF";

                                        table.Cell().Background(bg).BorderBottom(0.5f).BorderColor("#EDF2F7").Padding(3).AlignCenter().Text(itemIndex.ToString()).FontSize(8);
                                        
                                        table.Cell().Background(bg).BorderBottom(0.5f).BorderColor("#EDF2F7").Padding(3).Column(pc =>
                                        {
                                            pc.Item().Text(p.ProductName).FontSize(8.5f).Bold();
                                            if (!string.IsNullOrWhiteSpace(p.ProductCode))
                                                pc.Item().Text(p.ProductCode).FontSize(7).FontColor("#A0AEC0");
                                        });

                                        table.Cell().Background(bg).BorderBottom(0.5f).BorderColor("#EDF2F7").Padding(3).AlignCenter().Text(unitStr).FontSize(8);
                                        table.Cell().Background(bg).BorderBottom(0.5f).BorderColor("#EDF2F7").Padding(3).AlignRight().Text($"₹{mrpVal:F0}").FontSize(8).FontColor("#718096");
                                        table.Cell().Background(bg).BorderBottom(0.5f).BorderColor("#EDF2F7").Padding(3).AlignRight().Text($"₹{offerVal:F0}").FontSize(8.5f).Bold().FontColor("#E53E3E");
                                        table.Cell().Background(bg).BorderBottom(0.5f).BorderColor("#EDF2F7").Border(0.5f).BorderColor("#CBD5E0").Padding(3).Text("");
                                        table.Cell().Background(bg).BorderBottom(0.5f).BorderColor("#EDF2F7").Border(0.5f).BorderColor("#CBD5E0").Padding(3).Text("");
                                    }
                                });
                            });
                        }

                        // Order & Safety Notes
                        col.Item().PaddingTop(10).EnsureSpace().Background("#FFFAF0").Border(1).BorderColor("#FEEBC8").Padding(8).Column(nc =>
                        {
                            nc.Item().Text("Order & Safety Notes").FontSize(9).Bold().FontColor("#9C4221");
                            nc.Item().Text("• All prices listed are per box / piece as specified and are inclusive of applicable taxes.").FontSize(7.5f).FontColor("#7B341E");
                            nc.Item().Text("• Manufactured in Sivakasi following strict quality and safety standards.").FontSize(7.5f).FontColor("#7B341E");
                            nc.Item().Text("• Minors and children should use crackers only under adult supervision.").FontSize(7.5f).FontColor("#7B341E");
                        });
                    });

                    // FOOTER
                    page.Footer().PaddingTop(5).Row(row =>
                    {
                        row.RelativeItem().Text("Karthick Crackers · Sivakasi, Tamil Nadu | Official Price List 2026").FontSize(7.5f).FontColor("#718096");
                        row.AutoItem().Text(x =>
                        {
                            x.Span("Page ").FontSize(7.5f).FontColor("#718096");
                            x.CurrentPageNumber().FontSize(7.5f).FontColor("#718096");
                            x.Span(" of ").FontSize(7.5f).FontColor("#718096");
                            x.TotalPages().FontSize(7.5f).FontColor("#718096");
                        });
                    });
                });
            }).GeneratePdf();

            _logger.LogInformation("Successfully generated Price List PDF via QuestPDF. Output size: {Size} bytes.", pdfBytes.Length);
            return pdfBytes;
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
            _logger.LogInformation("Generating Invoice PDF via QuestPDF for Order #{OrderNumber}", order.OrderNumber);

            var paymentSetting = await _dbContext.PaymentSettings.FirstOrDefaultAsync();
            var callNumber = paymentSetting?.CallNumber ?? "+91 6380891094";
            var upiId = paymentSetting?.UpiId ?? "9952378965@upi";

            var items = order.OrderItems ?? new List<OrderItem>();

            byte[] pdfBytes = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(20, Unit.Point);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(9).FontColor("#1A1A1A").FontFamily("Arial"));

                    page.Header().Column(col =>
                    {
                        col.Item().BorderBottom(2).BorderColor("#F5C242").PaddingBottom(10).Row(row =>
                        {
                            row.RelativeItem().Column(c =>
                            {
                                c.Item().Text("Karthick Crackers").FontSize(22).Bold().FontColor("#B8860B");
                                c.Item().Text("DIRECT FROM SIVAKASI FACTORY OUTLET").FontSize(8).Bold().FontColor("#555555");
                            });

                            row.AutoItem().Background("#B8860B").PaddingHorizontal(12).PaddingVertical(6).Column(c =>
                            {
                                c.Item().Text("OFFICIAL INVOICE").FontSize(12).Bold().FontColor(Colors.White);
                                c.Item().Text($"Order #{order.OrderNumber}").FontSize(10).FontColor(Colors.White);
                            });
                        });
                    });

                    page.Content().PaddingTop(12).Column(col =>
                    {
                        // Customer & Order Info Grid
                        col.Item().Background("#FAF8F5").Border(1).BorderColor("#EAE5D9").Padding(10).Row(row =>
                        {
                            row.RelativeItem().Column(c =>
                            {
                                c.Item().Text("CUSTOMER DETAILS").FontSize(8.5f).Bold().FontColor("#B8860B");
                                c.Item().Text($"Name: {customer?.FullName ?? "Valued Customer"}").FontSize(9).Bold();
                                c.Item().Text($"Mobile: {customer?.MobileNumber ?? "N/A"}").FontSize(8.5f);
                                c.Item().Text($"Address: {customer?.Address ?? "N/A"}, {customer?.City} - {customer?.Pincode}").FontSize(8.5f);
                            });

                            row.RelativeItem().Column(c =>
                            {
                                c.Item().Text("ORDER DETAILS").FontSize(8.5f).Bold().FontColor("#B8860B");
                                c.Item().Text($"Order Date: {order.OrderDate:dd MMM yyyy, hh:mm tt}").FontSize(8.5f);
                                c.Item().Text($"Payment Status: {order.PaymentStatus}").FontSize(8.5f);
                                c.Item().Text($"Pay via UPI: {upiId}").FontSize(8.5f).Bold();
                                c.Item().Text($"Contact: {callNumber}").FontSize(8.5f);
                            });
                        });

                        // Items Table
                        col.Item().PaddingTop(12).Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.ConstantColumn(25);  // #
                                columns.ConstantColumn(55);  // Code
                                columns.RelativeColumn(1);   // Item Description
                                columns.ConstantColumn(40);  // Qty
                                columns.ConstantColumn(65);  // Unit Price
                                columns.ConstantColumn(75);  // Line Total
                            });

                            table.Header(header =>
                            {
                                header.Cell().Background("#F5C242").Padding(4).AlignCenter().Text("#").FontSize(8).Bold();
                                header.Cell().Background("#F5C242").Padding(4).Text("CODE").FontSize(8).Bold();
                                header.Cell().Background("#F5C242").Padding(4).Text("ITEM DESCRIPTION").FontSize(8).Bold();
                                header.Cell().Background("#F5C242").Padding(4).AlignCenter().Text("QTY").FontSize(8).Bold();
                                header.Cell().Background("#F5C242").Padding(4).AlignRight().Text("PRICE (₹)").FontSize(8).Bold();
                                header.Cell().Background("#F5C242").Padding(4).AlignRight().Text("AMOUNT (₹)").FontSize(8).Bold();
                            });

                            int idx = 1;
                            foreach (var item in items)
                            {
                                string bg = (idx % 2 == 0) ? "#FAF8F5" : "#FFFFFF";
                                string code = item.Product?.ProductCode ?? item.ProductCode ?? "";
                                string name = item.Product?.ProductName ?? item.ProductName ?? "Firework Item";

                                table.Cell().Background(bg).BorderBottom(0.5f).BorderColor("#EAE5D9").Padding(4).AlignCenter().Text(idx.ToString()).FontSize(8);
                                table.Cell().Background(bg).BorderBottom(0.5f).BorderColor("#EAE5D9").Padding(4).Text(code).FontSize(8).Bold().FontColor("#B8860B");
                                table.Cell().Background(bg).BorderBottom(0.5f).BorderColor("#EAE5D9").Padding(4).Text(name).FontSize(8.5f).Bold();
                                table.Cell().Background(bg).BorderBottom(0.5f).BorderColor("#EAE5D9").Padding(4).AlignCenter().Text(item.Quantity.ToString()).FontSize(8.5f).Bold();
                                table.Cell().Background(bg).BorderBottom(0.5f).BorderColor("#EAE5D9").Padding(4).AlignRight().Text($"₹{item.UnitPrice:N2}").FontSize(8.5f);
                                table.Cell().Background(bg).BorderBottom(0.5f).BorderColor("#EAE5D9").Padding(4).AlignRight().Text($"₹{item.TotalPrice:N2}").FontSize(8.5f).Bold();

                                idx++;
                            }
                        });

                        // Totals Summary
                        col.Item().PaddingTop(10).AlignRight().Width(220).Column(tc =>
                        {
                            tc.Item().Row(r =>
                            {
                                r.RelativeItem().Text("Subtotal:").FontSize(9);
                                r.AutoItem().Text($"₹{order.Subtotal:N2}").FontSize(9).Bold();
                            });

                            tc.Item().PaddingTop(2).Row(r =>
                            {
                                r.RelativeItem().Text("Delivery:").FontSize(9);
                                string delStr = order.DeliveryCharge > 0 ? $"₹{order.DeliveryCharge:N2}" : "As Applicable";
                                r.AutoItem().Text(delStr).FontSize(9);
                            });

                            tc.Item().PaddingTop(4).BorderTop(1.5f).BorderColor("#B8860B").PaddingTop(4).Row(r =>
                            {
                                r.RelativeItem().Text("Grand Total:").FontSize(11).Bold().FontColor("#B8860B");
                                r.AutoItem().Text($"₹{order.TotalAmount:N2}").FontSize(12).Bold().FontColor("#B8860B");
                            });
                        });
                    });

                    page.Footer().PaddingTop(10).AlignCenter().Text("Thank you for shopping with Karthick Crackers! Light up your celebration safely.").FontSize(8).FontColor("#777777");
                });
            }).GeneratePdf();

            _logger.LogInformation("Successfully generated Invoice PDF via QuestPDF for Order #{OrderNumber} ({Size} bytes)", order.OrderNumber, pdfBytes.Length);
            return pdfBytes;
        }
    }
}
