using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using KarthickCrackers.Api.Data;
using KarthickCrackers.Api.DTOs;

namespace KarthickCrackers.Api.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly ApplicationDbContext _dbContext;

        public DashboardService(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<DashboardStatsDto> GetDashboardStatsAsync()
        {
            var today = DateTime.UtcNow.Date;

            var totalProducts = await _dbContext.Products.CountAsync();
            var activeProducts = await _dbContext.Products.CountAsync(p => p.IsActive);
            var totalCategories = await _dbContext.Categories.CountAsync(c => c.IsActive);
            
            var totalOrders = await _dbContext.Orders.CountAsync();
            var todayOrders = await _dbContext.Orders.CountAsync(o => o.OrderDate.Date == today);
            
            var pendingOrders = await _dbContext.Orders.CountAsync(o => 
                o.OrderStatus == "Order Placed" || 
                o.OrderStatus == "Confirmed" || 
                o.OrderStatus == "Processing");
                
            var dispatchedOrders = await _dbContext.Orders.CountAsync(o => o.OrderStatus == "Dispatched");
            var deliveredOrders = await _dbContext.Orders.CountAsync(o => o.OrderStatus == "Delivered");
            var cancelledOrders = await _dbContext.Orders.CountAsync(o => o.OrderStatus == "Cancelled");

            var recentOrdersList = await _dbContext.Orders
                .Include(o => o.OrderItems)
                .OrderByDescending(o => o.OrderDate)
                .Take(50)
                .ToListAsync();

            var customerIds = recentOrdersList.Select(o => o.CustomerId).Distinct().ToList();
            var customers = await _dbContext.Customers
                .Where(c => customerIds.Contains(c.CustomerId))
                .ToDictionaryAsync(c => c.CustomerId);

            var recentOrders = recentOrdersList.Select(o => {
                var cust = customers.TryGetValue(o.CustomerId, out var c) ? c : null;
                return new RecentOrderDto
                {
                    OrderId = o.OrderId,
                    OrderNumber = o.OrderNumber,
                    CustomerId = o.CustomerId,
                    CustomerName = cust?.FullName ?? "Guest Customer",
                    CustomerPhone = cust?.MobileNumber ?? "N/A",
                    City = cust?.City ?? "N/A",
                    Address = cust != null ? $"{cust.Address}, {cust.City} - {cust.Pincode}" : "N/A",
                    OrderDate = o.OrderDate.ToString("yyyy-MM-ddTHH:mm:ss"),
                    TotalAmount = o.TotalAmount,
                    Status = o.OrderStatus,
                    ItemsCount = o.OrderItems?.Count ?? 0,
                    Items = o.OrderItems?.Select(oi => new OrderItemDto
                    {
                        OrderItemId = oi.OrderItemId,
                        ProductId = oi.ProductId,
                        ProductName = oi.ProductName,
                        ProductCode = oi.ProductCode,
                        Quantity = oi.Quantity,
                        UnitPrice = oi.UnitPrice,
                        TotalPrice = oi.TotalPrice
                    }).ToList() ?? new List<OrderItemDto>()
                };
            }).ToList();

            return new DashboardStatsDto
            {
                TotalProducts = totalProducts,
                ActiveProducts = activeProducts,
                TotalCategories = totalCategories,
                TotalOrders = totalOrders,
                TodayOrders = todayOrders,
                PendingOrders = pendingOrders,
                DispatchedOrders = dispatchedOrders,
                DeliveredOrders = deliveredOrders,
                CancelledOrders = cancelledOrders,
                RecentOrders = recentOrders
            };
        }
    }
}
