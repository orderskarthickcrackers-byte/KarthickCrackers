using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using KarthickCrackers.Api.Data;
using KarthickCrackers.Api.DTOs;

namespace KarthickCrackers.Api.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/admin/[controller]")]
    public class CustomersController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;

        public CustomersController(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        // GET: api/admin/customers
        [HttpGet]
        public async Task<IActionResult> GetCustomers([FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var customersQuery = _dbContext.Customers.AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var s = search.Trim().ToLower();
                customersQuery = customersQuery.Where(c => 
                    c.FullName.ToLower().Contains(s) || 
                    c.MobileNumber.Contains(s) || 
                    (c.Email != null && c.Email.ToLower().Contains(s)) ||
                    (c.City != null && c.City.ToLower().Contains(s))
                );
            }

            var totalCount = await customersQuery.CountAsync();
            var customers = await customersQuery
                .OrderByDescending(c => c.CreatedDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var customerIds = customers.Select(c => c.CustomerId).ToList();
            var orders = await _dbContext.Orders
                .Where(o => customerIds.Contains(o.CustomerId) && o.OrderStatus != "Cancelled")
                .ToListAsync();

            var orderStats = orders
                .GroupBy(o => o.CustomerId)
                .ToDictionary(
                    g => g.Key,
                    g => new { TotalOrders = g.Count(), TotalSpent = g.Sum(x => x.TotalAmount) }
                );

            var customerDtos = customers.Select(c => new CustomerDto
            {
                CustomerId = c.CustomerId,
                FullName = c.FullName,
                MobileNumber = c.MobileNumber,
                Email = c.Email,
                Address = c.Address,
                City = c.City,
                Pincode = c.Pincode,
                Remarks = c.Remarks,
                TotalOrders = orderStats.TryGetValue(c.CustomerId, out var stats) ? stats.TotalOrders : 0,
                TotalSpent = orderStats.TryGetValue(c.CustomerId, out stats) ? stats.TotalSpent : 0.00m,
                CreatedDate = c.CreatedDate.ToString("yyyy-MM-ddTHH:mm:ss")
            }).ToList();

            return Ok(new
            {
                totalCount,
                page,
                pageSize,
                totalPages = (int)Math.Ceiling((double)totalCount / pageSize),
                data = customerDtos
            });
        }

        // GET: api/admin/customers/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetCustomerById(int id)
        {
            var customer = await _dbContext.Customers.FirstOrDefaultAsync(c => c.CustomerId == id);
            if (customer == null) return NotFound(new { message = $"Customer ID {id} not found." });

            var orders = await _dbContext.Orders
                .Include(o => o.OrderItems)
                .Where(o => o.CustomerId == id)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();

            var orderDtos = orders.Select(o => new OrderDto
            {
                OrderId = o.OrderId,
                OrderNumber = o.OrderNumber,
                CustomerId = o.CustomerId,
                CustomerName = customer.FullName,
                MobileNumber = customer.MobileNumber,
                Address = customer.Address ?? "",
                City = customer.City ?? "",
                Pincode = customer.Pincode ?? "",
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
            }).ToList();

            var totalSpent = orders.Where(o => o.OrderStatus != "Cancelled").Sum(o => o.TotalAmount);

            var detailDto = new CustomerDetailDto
            {
                CustomerId = customer.CustomerId,
                FullName = customer.FullName,
                MobileNumber = customer.MobileNumber,
                Email = customer.Email,
                Address = customer.Address,
                City = customer.City,
                Pincode = customer.Pincode,
                Remarks = customer.Remarks,
                TotalOrders = orders.Count,
                TotalSpent = totalSpent,
                CreatedDate = customer.CreatedDate.ToString("yyyy-MM-ddTHH:mm:ss"),
                OrderHistory = orderDtos
            };

            return Ok(detailDto);
        }

        // PUT: api/admin/customers/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCustomer(int id, [FromBody] UpdateCustomerDto dto)
        {
            var customer = await _dbContext.Customers.FirstOrDefaultAsync(c => c.CustomerId == id);
            if (customer == null)
            {
                return NotFound(new { message = $"Customer ID {id} not found." });
            }

            if (string.IsNullOrWhiteSpace(dto.FullName))
            {
                return BadRequest(new { message = "Full Name is required." });
            }

            if (string.IsNullOrWhiteSpace(dto.MobileNumber))
            {
                return BadRequest(new { message = "Mobile Number is required." });
            }

            customer.FullName = dto.FullName.Trim();
            customer.MobileNumber = dto.MobileNumber.Trim();
            customer.Email = string.IsNullOrWhiteSpace(dto.Email) ? null : dto.Email.Trim();
            customer.Address = string.IsNullOrWhiteSpace(dto.Address) ? null : dto.Address.Trim();
            customer.City = string.IsNullOrWhiteSpace(dto.City) ? null : dto.City.Trim();
            customer.Pincode = string.IsNullOrWhiteSpace(dto.Pincode) ? null : dto.Pincode.Trim();
            customer.Remarks = string.IsNullOrWhiteSpace(dto.Remarks) ? null : dto.Remarks.Trim();
            customer.ModifiedDate = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();

            var orders = await _dbContext.Orders
                .Where(o => o.CustomerId == id && o.OrderStatus != "Cancelled")
                .ToListAsync();

            var customerDto = new CustomerDto
            {
                CustomerId = customer.CustomerId,
                FullName = customer.FullName,
                MobileNumber = customer.MobileNumber,
                Email = customer.Email,
                Address = customer.Address,
                City = customer.City,
                Pincode = customer.Pincode,
                Remarks = customer.Remarks,
                TotalOrders = orders.Count,
                TotalSpent = orders.Sum(o => o.TotalAmount),
                CreatedDate = customer.CreatedDate.ToString("yyyy-MM-ddTHH:mm:ss")
            };

            return Ok(customerDto);
        }

        // DELETE: api/admin/customers/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCustomer(int id)
        {
            var customer = await _dbContext.Customers.FirstOrDefaultAsync(c => c.CustomerId == id);
            if (customer == null)
            {
                return NotFound(new { message = $"Customer ID {id} not found." });
            }

            var orders = await _dbContext.Orders.Where(o => o.CustomerId == id).ToListAsync();
            if (orders.Any())
            {
                _dbContext.Orders.RemoveRange(orders);
            }

            _dbContext.Customers.Remove(customer);
            await _dbContext.SaveChangesAsync();

            return Ok(new { message = $"Customer #{id} ({customer.FullName}) deleted successfully." });
        }
    }
}
