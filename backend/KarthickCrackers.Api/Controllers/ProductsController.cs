using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using KarthickCrackers.Api.Services;

namespace KarthickCrackers.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly IProductService _productService;
        private readonly IPdfExportService _pdfExportService;
        private readonly ILogger<ProductsController> _logger;

        public ProductsController(
            IProductService productService,
            IPdfExportService pdfExportService,
            ILogger<ProductsController> logger)
        {
            _productService = productService;
            _pdfExportService = pdfExportService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetProducts([FromQuery] string? search, [FromQuery] int? categoryId)
        {
            // Returns only active & available products with TotalQuantity > 0
            var products = await _productService.GetCustomerProductsAsync(search, categoryId);
            return Ok(products);
        }

        [HttpGet("price-list/pdf")]
        public async Task<IActionResult> DownloadPriceListPdf([FromQuery] int? categoryId)
        {
            try
            {
                _logger.LogInformation("PDF price list download endpoint called for categoryId: {CategoryId}", categoryId);
                var pdfBytes = await _pdfExportService.GeneratePriceListPdfAsync(categoryId);

                const string fileName = "Karthick_Crackers_Price_List_2026.pdf";
                return File(pdfBytes, "application/pdf", fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to generate price list PDF in ProductsController");
                return StatusCode(500, new { message = "An error occurred while generating the PDF price list.", details = ex.Message });
            }
        }

        [HttpGet("{idOrCode}")]
        public async Task<IActionResult> GetProduct(string idOrCode)
        {
            if (int.TryParse(idOrCode, out int id))
            {
                var product = await _productService.GetProductByIdAsync(id);
                if (product != null && product.IsActive && product.IsAvailable && product.TotalQuantity > 0)
                {
                    return Ok(product);
                }
            }
            else
            {
                var product = await _productService.GetProductByCodeAsync(idOrCode);
                if (product != null && product.IsActive && product.IsAvailable && product.TotalQuantity > 0)
                {
                    return Ok(product);
                }
            }

            return NotFound(new { message = "Product not found or unavailable." });
        }
    }
}
