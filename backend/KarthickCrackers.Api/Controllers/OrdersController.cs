using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using KarthickCrackers.Api.Data;
using KarthickCrackers.Api.DTOs;
using KarthickCrackers.Api.Entities;
using KarthickCrackers.Api.Services;

namespace KarthickCrackers.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly IWhatsAppService _whatsAppService;
        private readonly IPdfExportService _pdfExportService;
        private readonly IEmailService _emailService;

        public OrdersController(
            ApplicationDbContext dbContext,
            IWhatsAppService whatsAppService,
            IPdfExportService pdfExportService,
            IEmailService emailService)
        {
            _dbContext = dbContext;
            _whatsAppService = whatsAppService;
            _pdfExportService = pdfExportService;
            _emailService = emailService;
        }

        // POST: api/orders (Public - Place New Order)
        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                if (dto.Items == null || !dto.Items.Any())
                {
                    return BadRequest(new { message = "Cart items cannot be empty." });
                }

                // 1. Fetch Product details from DB
                var productIds = dto.Items.Select(i => i.ProductId).Distinct().ToList();
                var products = await _dbContext.Products
                    .Where(p => productIds.Contains(p.ProductId))
                    .ToDictionaryAsync(p => p.ProductId);

                decimal subtotal = 0;
                var orderItems = new List<OrderItem>();

                foreach (var item in dto.Items)
                {
                    if (!products.TryGetValue(item.ProductId, out var product))
                    {
                        return BadRequest(new { message = $"Product ID {item.ProductId} not found." });
                    }

                    if (item.Quantity <= 0)
                    {
                        return BadRequest(new { message = $"Invalid quantity for product {product.ProductName}." });
                    }

                    decimal lineTotal = product.Price * item.Quantity;
                    subtotal += lineTotal;

                    orderItems.Add(new OrderItem
                    {
                        ProductId = product.ProductId,
                        ProductName = product.ProductName,
                        ProductCode = product.ProductCode,
                        Quantity = item.Quantity,
                        UnitPrice = product.Price,
                        TotalPrice = lineTotal
                    });
                }

                // 2. Minimum Order Amount Validation (₹2500)
                if (subtotal < 2500.00m)
                {
                    return BadRequest(new { message = "Minimum order amount is ₹2,500. Please add more items to place your order." });
                }

                // 3. Find or Create Customer by Mobile Number
                var mobileClean = dto.MobileNumber.Trim();
                var customer = await _dbContext.Customers.FirstOrDefaultAsync(c => c.MobileNumber == mobileClean);

                if (customer == null)
                {
                    customer = new Customer
                    {
                        FullName = dto.CustomerName.Trim(),
                        MobileNumber = mobileClean,
                        Email = dto.Email?.Trim(),
                        Address = dto.Address.Trim(),
                        City = dto.City.Trim(),
                        Pincode = dto.Pincode.Trim(),
                        Remarks = dto.Remarks?.Trim(),
                        CreatedDate = DateTime.UtcNow
                    };
                    _dbContext.Customers.Add(customer);
                    await _dbContext.SaveChangesAsync();
                }
                else
                {
                    // Update customer profile details if changed
                    customer.FullName = dto.CustomerName.Trim();
                    customer.Address = dto.Address.Trim();
                    customer.City = dto.City.Trim();
                    customer.Pincode = dto.Pincode.Trim();
                    if (!string.IsNullOrWhiteSpace(dto.Email)) customer.Email = dto.Email.Trim();
                    customer.ModifiedDate = DateTime.UtcNow;
                    await _dbContext.SaveChangesAsync();
                }

                // 4. Create Order with Sequential Invoice Number (e.g. KC10008, KC10009...)
                var lastOrderNumber = await _dbContext.Orders
                    .OrderByDescending(o => o.OrderId)
                    .Select(o => o.OrderNumber)
                    .FirstOrDefaultAsync();

                int nextSeq = 10001;
                if (!string.IsNullOrEmpty(lastOrderNumber))
                {
                    var digits = new string(lastOrderNumber.Where(char.IsDigit).ToArray());
                    if (int.TryParse(digits, out int currentSeq) && currentSeq >= 10000)
                    {
                        nextSeq = currentSeq + 1;
                    }
                }

                var orderNumber = $"KC{nextSeq}";

                var order = new Order
                {
                    OrderNumber = orderNumber,
                    CustomerId = customer.CustomerId,
                    OrderDate = DateTime.UtcNow,
                    Subtotal = subtotal,
                    DeliveryCharge = 0.00m,
                    TotalAmount = subtotal,
                    OrderStatus = "Order Placed",
                    PaymentStatus = "Pending",
                    CreatedDate = DateTime.UtcNow
                };

                _dbContext.Orders.Add(order);
                await _dbContext.SaveChangesAsync();

                // 5. Attach OrderId to OrderItems and save
                foreach (var oi in orderItems)
                {
                    oi.OrderId = order.OrderId;
                    _dbContext.OrderItems.Add(oi);
                }

                // 6. Log Status History
                _dbContext.OrderStatusHistories.Add(new OrderStatusHistory
                {
                    OrderId = order.OrderId,
                    OldStatus = null,
                    NewStatus = "Order Placed",
                    ChangedDate = DateTime.UtcNow,
                    Remarks = dto.Remarks ?? "Order placed online"
                });

                await _dbContext.SaveChangesAsync();

                // 7. AUTOMATIC ADMIN EMAIL NOTIFICATION DISPATCH (WITH ATTACHED ORDER PDF DOCUMENT)
                var scopeFactory = HttpContext.RequestServices.GetRequiredService<IServiceScopeFactory>();
                _ = Task.Run(async () => {
                    using var scope = scopeFactory.CreateScope();
                    try
                    {
                        var scopedPdfExportService = scope.ServiceProvider.GetRequiredService<IPdfExportService>();
                        var scopedEmailService = scope.ServiceProvider.GetRequiredService<IEmailService>();

                        var pdfBytes = await scopedPdfExportService.GenerateOrderInvoicePdfAsync(order.OrderId);
                        await scopedEmailService.SendNewOrderAdminNotificationAsync(order, customer, orderItems, pdfBytes);
                    }
                    catch (Exception)
                    {
                        try
                        {
                            var scopedEmailService = scope.ServiceProvider.GetRequiredService<IEmailService>();
                            await scopedEmailService.SendNewOrderAdminNotificationAsync(order, customer, orderItems);
                        }
                        catch
                        {
                            // Fallback ignore
                        }
                    }
                });

                var responseDto = new OrderDto
                {
                    OrderId = order.OrderId,
                    OrderNumber = order.OrderNumber,
                    CustomerId = customer.CustomerId,
                    CustomerName = customer.FullName,
                    MobileNumber = customer.MobileNumber,
                    Address = customer.Address,
                    City = customer.City,
                    Pincode = customer.Pincode,
                    OrderDate = order.OrderDate.ToString("yyyy-MM-ddTHH:mm:ss"),
                    Subtotal = order.Subtotal,
                    DeliveryCharge = order.DeliveryCharge,
                    TotalAmount = order.TotalAmount,
                    OrderStatus = order.OrderStatus,
                    PaymentStatus = order.PaymentStatus,
                    Remarks = dto.Remarks,
                    OrderItems = orderItems.Select(oi => new OrderItemDto
                    {
                        OrderItemId = oi.OrderItemId,
                        ProductId = oi.ProductId,
                        ProductName = oi.ProductName,
                        ProductCode = oi.ProductCode,
                        Quantity = oi.Quantity,
                        UnitPrice = oi.UnitPrice,
                        TotalPrice = oi.TotalPrice
                    }).ToList()
                };

                return CreatedAtAction(nameof(GetOrderById), new { id = order.OrderId }, responseDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while placing the order.", details = ex.Message });
            }
        }

        // GET: api/orders/{id} (Public)
        [HttpGet("{id}")]
        public async Task<IActionResult> GetOrderById(int id)
        {
            var order = await _dbContext.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.OrderId == id);

            if (order == null) return NotFound();

            var customer = await _dbContext.Customers.FirstOrDefaultAsync(c => c.CustomerId == order.CustomerId);

            var dto = new OrderDto
            {
                OrderId = order.OrderId,
                OrderNumber = order.OrderNumber,
                CustomerId = order.CustomerId,
                CustomerName = customer?.FullName ?? "Guest Customer",
                MobileNumber = customer?.MobileNumber ?? "",
                Address = customer?.Address ?? "",
                City = customer?.City ?? "",
                Pincode = customer?.Pincode ?? "",
                OrderDate = order.OrderDate.ToString("yyyy-MM-ddTHH:mm:ss"),
                Subtotal = order.Subtotal,
                DeliveryCharge = order.DeliveryCharge,
                TotalAmount = order.TotalAmount,
                OrderStatus = order.OrderStatus,
                PaymentStatus = order.PaymentStatus,
                OrderItems = order.OrderItems.Select(oi => new OrderItemDto
                {
                    OrderItemId = oi.OrderItemId,
                    ProductId = oi.ProductId,
                    ProductName = oi.ProductName,
                    ProductCode = oi.ProductCode,
                    Quantity = oi.Quantity,
                    UnitPrice = oi.UnitPrice,
                    TotalPrice = oi.TotalPrice
                }).ToList()
            };

            return Ok(dto);
        }

        // GET: api/orders/{id}/pdf (Public - Download Order Invoice PDF)
        [HttpGet("{id}/pdf")]
        public async Task<IActionResult> DownloadOrderPdf(int id)
        {
            try
            {
                var pdfBytes = await _pdfExportService.GenerateOrderInvoicePdfAsync(id);
                return File(pdfBytes, "application/pdf", $"KarthickCrackers_Invoice_{id}.pdf");
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        // GET: api/orders/number/{orderNumber}/pdf (Public - Download Order Invoice PDF by Order Number)
        [HttpGet("number/{orderNumber}/pdf")]
        public async Task<IActionResult> DownloadOrderPdfByNumber(string orderNumber)
        {
            try
            {
                var pdfBytes = await _pdfExportService.GenerateOrderInvoicePdfByNumberAsync(orderNumber);
                return File(pdfBytes, "application/pdf", $"KarthickCrackers_Invoice_{orderNumber}.pdf");
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        // GET: api/orders/admin/list (Admin Only - Filtered & Paged Orders)
        [HttpGet("admin/list")]
        [Authorize]
        public async Task<IActionResult> GetAdminOrders([FromQuery] string? search, [FromQuery] string? status, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var query = _dbContext.Orders.Include(o => o.OrderItems).AsQueryable();

            if (!string.IsNullOrWhiteSpace(status) && status.ToLower() != "all")
            {
                query = query.Where(o => o.OrderStatus == status);
            }

            var ordersList = await query.OrderByDescending(o => o.OrderDate).ToListAsync();
            var customerIds = ordersList.Select(o => o.CustomerId).Distinct().ToList();
            var customers = await _dbContext.Customers.Where(c => customerIds.Contains(c.CustomerId)).ToDictionaryAsync(c => c.CustomerId);

            var items = ordersList.Select(o => {
                var cust = customers.TryGetValue(o.CustomerId, out var c) ? c : null;
                return new OrderDto
                {
                    OrderId = o.OrderId,
                    OrderNumber = o.OrderNumber,
                    CustomerId = o.CustomerId,
                    CustomerName = cust?.FullName ?? "Guest Customer",
                    MobileNumber = cust?.MobileNumber ?? "",
                    Address = cust?.Address ?? "",
                    City = cust?.City ?? "",
                    Pincode = cust?.Pincode ?? "",
                    OrderDate = o.OrderDate.ToString("yyyy-MM-ddTHH:mm:ss"),
                    Subtotal = o.Subtotal,
                    DeliveryCharge = o.DeliveryCharge,
                    TotalAmount = o.TotalAmount,
                    OrderStatus = o.OrderStatus,
                    PaymentStatus = o.PaymentStatus,
                    OrderItems = o.OrderItems.Select(oi => new OrderItemDto
                    {
                        OrderItemId = oi.OrderItemId,
                        ProductId = oi.ProductId,
                        ProductName = oi.ProductName,
                        ProductCode = oi.ProductCode,
                        Quantity = oi.Quantity,
                        UnitPrice = oi.UnitPrice,
                        TotalPrice = oi.TotalPrice
                    }).ToList()
                };
            }).ToList();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var s = search.Trim().ToLower();
                items = items.Where(i => 
                    i.OrderNumber.ToLower().Contains(s) || 
                    i.CustomerName.ToLower().Contains(s) || 
                    i.MobileNumber.Contains(s) ||
                    i.City.ToLower().Contains(s)
                ).ToList();
            }

            int totalCount = items.Count;
            var pagedItems = items.Skip((page - 1) * pageSize).Take(pageSize).ToList();

            return Ok(new
            {
                totalCount,
                page,
                pageSize,
                totalPages = (int)Math.Ceiling((double)totalCount / pageSize),
                data = pagedItems
            });
        }

        // PUT: api/orders/admin/{id}/status (Admin Only - Update Order Status)
        [HttpPut("admin/{id}/status")]
        [Authorize]
        public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] UpdateOrderStatusDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var order = await _dbContext.Orders.FirstOrDefaultAsync(o => o.OrderId == id);
            if (order == null) return NotFound(new { message = $"Order ID {id} not found." });

            var customer = await _dbContext.Customers.FirstOrDefaultAsync(c => c.CustomerId == order.CustomerId);

            var oldStatus = order.OrderStatus;
            order.OrderStatus = dto.Status;
            order.ModifiedDate = DateTime.UtcNow;

            _dbContext.OrderStatusHistories.Add(new OrderStatusHistory
            {
                OrderId = order.OrderId,
                OldStatus = oldStatus,
                NewStatus = dto.Status,
                ChangedDate = DateTime.UtcNow,
                Remarks = dto.Remarks ?? $"Status changed from '{oldStatus}' to '{dto.Status}'"
            });

            await _dbContext.SaveChangesAsync();

            // AUTOMATIC WHATSAPP STATUS UPDATE DISPATCH
            if (customer != null)
            {
                _ = Task.Run(async () => {
                    await _whatsAppService.SendStatusUpdateNotificationAsync(order, customer, dto.Status, dto.Remarks);
                });
            }

            return Ok(new { message = "Order status updated successfully.", orderId = id, newStatus = dto.Status });
        }
    }
}
