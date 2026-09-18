using System;
using System.Collections.Generic;

namespace KarthickCrackers.Api.DTOs
{
    public class CustomerDto
    {
        public int CustomerId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string MobileNumber { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? Pincode { get; set; }
        public string? Remarks { get; set; }
        public int TotalOrders { get; set; }
        public decimal TotalSpent { get; set; }
        public string CreatedDate { get; set; } = string.Empty;
    }

    public class CustomerDetailDto : CustomerDto
    {
        public List<OrderDto> OrderHistory { get; set; } = new List<OrderDto>();
    }

    public class UpdateCustomerDto
    {
        public string FullName { get; set; } = string.Empty;
        public string MobileNumber { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? Pincode { get; set; }
        public string? Remarks { get; set; }
    }
}
