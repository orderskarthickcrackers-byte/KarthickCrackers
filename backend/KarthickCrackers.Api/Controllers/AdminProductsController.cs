using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using KarthickCrackers.Api.DTOs;
using KarthickCrackers.Api.Services;

namespace KarthickCrackers.Api.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/admin/products")]
    public class AdminProductsController : ControllerBase
    {
        private readonly IProductService _productService;

        public AdminProductsController(IProductService productService)
        {
            _productService = productService;
        }

        [HttpGet]
        public async Task<IActionResult> GetProducts([FromQuery] string? search, [FromQuery] int? categoryId)
        {
            var products = await _productService.GetAdminProductsAsync(search, categoryId);
            return Ok(products);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetProductById(int id)
        {
            var product = await _productService.GetProductByIdAsync(id);
            if (product == null) return NotFound(new { message = $"Product with ID {id} not found." });
            return Ok(product);
        }

        [HttpPost]
        public async Task<IActionResult> CreateProduct([FromBody] CreateProductDto dto)
        {
            try
            {
                var created = await _productService.CreateProductAsync(dto);
                return CreatedAtAction(nameof(GetProductById), new { id = created.ProductId }, created);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateProduct(int id, [FromBody] UpdateProductDto dto)
        {
            try
            {
                var updated = await _productService.UpdateProductAsync(id, dto);
                if (updated == null) return NotFound(new { message = $"Product with ID {id} not found." });
                return Ok(updated);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var success = await _productService.DeleteProductAsync(id);
            if (!success) return NotFound(new { message = $"Product with ID {id} not found." });
            return Ok(new { message = "Product deactivated successfully." });
        }

        [HttpPost("import")]
        public async Task<IActionResult> ImportProducts([FromForm] IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { message = "Please select a valid CSV or Excel file to upload." });
            }

            using (var stream = file.OpenReadStream())
            {
                var result = await _productService.ImportProductsFromStreamAsync(stream, file.FileName);
                return Ok(result);
            }
        }
    }
}
