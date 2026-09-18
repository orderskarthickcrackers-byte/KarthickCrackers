using System.Collections.Generic;

namespace KarthickCrackers.Api.DTOs
{
    public class ProductDto
    {
        public int ProductId { get; set; }
        public string ProductCode { get; set; } = string.Empty;
        public string ProductName { get; set; } = string.Empty;
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public decimal MRPPrice { get; set; }
        public decimal DiscountPercentage { get; set; }
        public decimal DiscountPrice { get; set; }
        public int TotalQuantity { get; set; }
        public string? Unit { get; set; }
        public string? ImageUrl { get; set; }
        public bool IsAvailable { get; set; }
        public bool IsActive { get; set; }
    }

    public class CreateProductDto
    {
        public string ProductCode { get; set; } = string.Empty;
        public string ProductName { get; set; } = string.Empty;
        public int CategoryId { get; set; }
        public string? Description { get; set; }
        public decimal MRPPrice { get; set; }
        public decimal DiscountPercentage { get; set; }
        public string? Unit { get; set; }
        public int TotalQuantity { get; set; }
        public string? ImageUrl { get; set; }
        public bool IsAvailable { get; set; } = true;
        public bool IsActive { get; set; } = true;
    }

    public class UpdateProductDto
    {
        public string ProductCode { get; set; } = string.Empty;
        public string ProductName { get; set; } = string.Empty;
        public int CategoryId { get; set; }
        public string? Description { get; set; }
        public decimal MRPPrice { get; set; }
        public decimal DiscountPercentage { get; set; }
        public string? Unit { get; set; }
        public int TotalQuantity { get; set; }
        public string? ImageUrl { get; set; }
        public bool IsAvailable { get; set; }
        public bool IsActive { get; set; }
    }

    public class ProductImportResultDto
    {
        public int TotalRecords { get; set; }
        public int SuccessfullyImported { get; set; }
        public int FailedCount { get; set; }
        public List<ProductImportRowErrorDto> FailedRecords { get; set; } = new List<ProductImportRowErrorDto>();
    }

    public class ProductImportRowErrorDto
    {
        public int RowNumber { get; set; }
        public string ProductCode { get; set; } = string.Empty;
        public string ProductName { get; set; } = string.Empty;
        public string Reason { get; set; } = string.Empty;
    }
}
