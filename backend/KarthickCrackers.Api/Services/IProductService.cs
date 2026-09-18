using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using KarthickCrackers.Api.DTOs;

namespace KarthickCrackers.Api.Services
{
    public interface IProductService
    {
        Task<List<ProductDto>> GetAdminProductsAsync(string? search = null, int? categoryId = null);
        Task<List<ProductDto>> GetCustomerProductsAsync(string? search = null, int? categoryId = null);
        Task<ProductDto?> GetProductByIdAsync(int id);
        Task<ProductDto?> GetProductByCodeAsync(string code);
        Task<ProductDto> CreateProductAsync(CreateProductDto dto);
        Task<ProductDto?> UpdateProductAsync(int id, UpdateProductDto dto);
        Task<bool> DeleteProductAsync(int id);
        Task<ProductImportResultDto> ImportProductsFromStreamAsync(Stream fileStream, string fileName);
    }
}
