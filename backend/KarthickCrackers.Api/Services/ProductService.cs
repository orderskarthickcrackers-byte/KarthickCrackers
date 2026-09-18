using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using KarthickCrackers.Api.Data;
using KarthickCrackers.Api.DTOs;
using KarthickCrackers.Api.Entities;

namespace KarthickCrackers.Api.Services
{
    public class ProductService : IProductService
    {
        private readonly ApplicationDbContext _dbContext;

        public ProductService(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<List<ProductDto>> GetAdminProductsAsync(string? search = null, int? categoryId = null)
        {
            var categories = await _dbContext.Categories.ToDictionaryAsync(c => c.CategoryId, c => c.CategoryName);

            var query = _dbContext.Products.AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim().ToLower();
                query = query.Where(p => p.ProductName.ToLower().Contains(term) || p.ProductCode.ToLower().Contains(term));
            }

            if (categoryId.HasValue && categoryId.Value > 0)
            {
                query = query.Where(p => p.CategoryId == categoryId.Value);
            }

            var products = await query.OrderByDescending(p => p.ProductId).ToListAsync();

            return products.Select(p => MapToDto(p, categories)).ToList();
        }

        public async Task<List<ProductDto>> GetCustomerProductsAsync(string? search = null, int? categoryId = null)
        {
            var categories = await _dbContext.Categories.Where(c => c.IsActive).ToDictionaryAsync(c => c.CategoryId, c => c.CategoryName);

            // Customer rule: IsActive = true, IsAvailable = true, TotalQuantity > 0
            var query = _dbContext.Products.Where(p => p.IsActive && p.IsAvailable && p.TotalQuantity > 0);

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim().ToLower();
                query = query.Where(p => p.ProductName.ToLower().Contains(term) || p.ProductCode.ToLower().Contains(term));
            }

            if (categoryId.HasValue && categoryId.Value > 0)
            {
                query = query.Where(p => p.CategoryId == categoryId.Value);
            }

            var products = await query.OrderBy(p => p.ProductId).ToListAsync();

            return products.Select(p => MapToDto(p, categories)).ToList();
        }

        public async Task<ProductDto?> GetProductByIdAsync(int id)
        {
            var product = await _dbContext.Products.FirstOrDefaultAsync(p => p.ProductId == id);
            if (product == null) return null;

            var category = await _dbContext.Categories.FirstOrDefaultAsync(c => c.CategoryId == product.CategoryId);
            var categoryName = category?.CategoryName ?? "General";

            return MapToDto(product, new Dictionary<int, string> { { product.CategoryId, categoryName } });
        }

        public async Task<ProductDto?> GetProductByCodeAsync(string code)
        {
            var product = await _dbContext.Products.FirstOrDefaultAsync(p => p.ProductCode.ToLower() == code.Trim().ToLower());
            if (product == null) return null;

            var category = await _dbContext.Categories.FirstOrDefaultAsync(c => c.CategoryId == product.CategoryId);
            var categoryName = category?.CategoryName ?? "General";

            return MapToDto(product, new Dictionary<int, string> { { product.CategoryId, categoryName } });
        }

        public async Task<ProductDto> CreateProductAsync(CreateProductDto dto)
        {
            if (dto.DiscountPercentage < 0 || dto.DiscountPercentage > 100)
            {
                throw new ArgumentException("Discount percentage must be between 0 and 100.");
            }

            if (dto.MRPPrice < 0)
            {
                throw new ArgumentException("MRP price cannot be negative.");
            }

            var existingCode = await _dbContext.Products.AnyAsync(p => p.ProductCode.ToLower() == dto.ProductCode.Trim().ToLower());
            if (existingCode)
            {
                throw new InvalidOperationException($"Product with code '{dto.ProductCode}' already exists.");
            }

            var categoryExists = await _dbContext.Categories.AnyAsync(c => c.CategoryId == dto.CategoryId);
            if (!categoryExists)
            {
                throw new ArgumentException($"Category ID {dto.CategoryId} does not exist.");
            }

            decimal discountPrice = CalculateDiscountPrice(dto.MRPPrice, dto.DiscountPercentage);

            var product = new Product
            {
                ProductCode = dto.ProductCode.Trim(),
                ProductName = dto.ProductName.Trim(),
                CategoryId = dto.CategoryId,
                Description = dto.Description?.Trim(),
                MRPPrice = dto.MRPPrice,
                DiscountPercentage = dto.DiscountPercentage,
                DiscountPrice = discountPrice,
                Price = discountPrice,
                TotalQuantity = dto.TotalQuantity,
                Unit = dto.Unit?.Trim(),
                ImageUrl = dto.ImageUrl?.Trim() ?? "/assets/images/sparklers.jpg",
                IsAvailable = dto.IsAvailable,
                IsActive = dto.IsActive,
                CreatedDate = DateTime.UtcNow
            };

            _dbContext.Products.Add(product);
            await _dbContext.SaveChangesAsync();

            return await GetProductByIdAsync(product.ProductId) ?? MapToDto(product, new Dictionary<int, string>());
        }

        public async Task<ProductDto?> UpdateProductAsync(int id, UpdateProductDto dto)
        {
            if (dto.DiscountPercentage < 0 || dto.DiscountPercentage > 100)
            {
                throw new ArgumentException("Discount percentage must be between 0 and 100.");
            }

            if (dto.MRPPrice < 0)
            {
                throw new ArgumentException("MRP price cannot be negative.");
            }

            var product = await _dbContext.Products.FirstOrDefaultAsync(p => p.ProductId == id);
            if (product == null) return null;

            var existingCode = await _dbContext.Products.AnyAsync(p => p.ProductId != id && p.ProductCode.ToLower() == dto.ProductCode.Trim().ToLower());
            if (existingCode)
            {
                throw new InvalidOperationException($"Product with code '{dto.ProductCode}' already exists.");
            }

            decimal discountPrice = CalculateDiscountPrice(dto.MRPPrice, dto.DiscountPercentage);

            product.ProductCode = dto.ProductCode.Trim();
            product.ProductName = dto.ProductName.Trim();
            product.CategoryId = dto.CategoryId;
            product.Description = dto.Description?.Trim();
            product.MRPPrice = dto.MRPPrice;
            product.DiscountPercentage = dto.DiscountPercentage;
            product.DiscountPrice = discountPrice;
            product.Price = discountPrice;
            product.TotalQuantity = dto.TotalQuantity;
            product.Unit = dto.Unit?.Trim();
            if (!string.IsNullOrWhiteSpace(dto.ImageUrl))
            {
                product.ImageUrl = dto.ImageUrl.Trim();
            }
            product.IsAvailable = dto.IsAvailable;
            product.IsActive = dto.IsActive;
            product.ModifiedDate = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();

            return await GetProductByIdAsync(product.ProductId);
        }

        public async Task<bool> DeleteProductAsync(int id)
        {
            var product = await _dbContext.Products.FirstOrDefaultAsync(p => p.ProductId == id);
            if (product == null) return false;

            // Soft-delete / deactivate product
            product.IsActive = false;
            product.IsAvailable = false;
            product.ModifiedDate = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();
            return true;
        }

        public async Task<ProductImportResultDto> ImportProductsFromStreamAsync(Stream fileStream, string fileName)
        {
            var result = new ProductImportResultDto();
            var existingCategories = await _dbContext.Categories.ToListAsync();
            var categoryMap = existingCategories.ToDictionary(c => c.CategoryName.Trim().ToLower(), c => c.CategoryId);

            var existingCodes = (await _dbContext.Products.Select(p => p.ProductCode.ToLower()).ToListAsync()).ToHashSet();
            var importCodes = new HashSet<string>();

            var lines = new List<string>();

            using (var reader = new StreamReader(fileStream, Encoding.UTF8))
            {
                string? line;
                while ((line = await reader.ReadLineAsync()) != null)
                {
                    if (!string.IsNullOrWhiteSpace(line))
                    {
                        lines.Add(line);
                    }
                }
            }

            if (lines.Count <= 1)
            {
                result.FailedRecords.Add(new ProductImportRowErrorDto
                {
                    RowNumber = 1,
                    Reason = "The uploaded file is empty or does not contain data rows."
                });
                result.TotalRecords = 0;
                result.FailedCount = 1;
                return result;
            }

            // Detect CSV or Tab delimited
            var headerLine = lines[0];
            char delimiter = headerLine.Contains(',') ? ',' : '\t';
            var headers = ParseCsvLine(headerLine, delimiter).Select(h => h.Trim().ToLower()).ToList();

            int codeIdx = headers.IndexOf("productcode");
            int nameIdx = headers.IndexOf("productname");
            int catIdx = headers.IndexOf("category");
            int descIdx = headers.IndexOf("description");
            int mrpIdx = headers.IndexOf("mrpprice");
            int discIdx = headers.IndexOf("discountpercentage");
            int unitIdx = headers.IndexOf("unit");
            int qtyIdx = headers.IndexOf("totalquantity");
            int imgIdx = headers.IndexOf("imageurl");
            int availIdx = headers.IndexOf("isavailable");
            int activeIdx = headers.IndexOf("isactive");

            // Check required column headers
            if (codeIdx == -1 || nameIdx == -1 || mrpIdx == -1)
            {
                result.FailedRecords.Add(new ProductImportRowErrorDto
                {
                    RowNumber = 1,
                    Reason = "Missing required column headers. Expected: ProductCode, ProductName, MRPPrice, Category, DiscountPercentage, TotalQuantity."
                });
                result.FailedCount = 1;
                return result;
            }

            var newProducts = new List<Product>();

            for (int i = 1; i < lines.Count; i++)
            {
                int rowNumber = i + 1;
                var cells = ParseCsvLine(lines[i], delimiter);

                string code = GetCell(cells, codeIdx);
                string name = GetCell(cells, nameIdx);
                string catName = GetCell(cells, catIdx, "General");
                string desc = GetCell(cells, descIdx);
                string mrpStr = GetCell(cells, mrpIdx);
                string discStr = GetCell(cells, discIdx, "0");
                string unit = GetCell(cells, unitIdx, "1 Box");
                string qtyStr = GetCell(cells, qtyIdx, "50");
                string imgUrl = GetCell(cells, imgIdx, "/assets/images/sparklers.jpg");
                string availStr = GetCell(cells, availIdx, "true");
                string activeStr = GetCell(cells, activeIdx, "true");

                if (string.IsNullOrWhiteSpace(code) || string.IsNullOrWhiteSpace(name))
                {
                    result.FailedRecords.Add(new ProductImportRowErrorDto
                    {
                        RowNumber = rowNumber,
                        ProductCode = code,
                        ProductName = name,
                        Reason = "ProductCode and ProductName are required."
                    });
                    continue;
                }

                code = code.Trim();
                name = name.Trim();

                if (existingCodes.Contains(code.ToLower()) || importCodes.Contains(code.ToLower()))
                {
                    result.FailedRecords.Add(new ProductImportRowErrorDto
                    {
                        RowNumber = rowNumber,
                        ProductCode = code,
                        ProductName = name,
                        Reason = $"Duplicate ProductCode '{code}'."
                    });
                    continue;
                }

                if (!decimal.TryParse(mrpStr, out decimal mrpPrice) || mrpPrice < 0)
                {
                    result.FailedRecords.Add(new ProductImportRowErrorDto
                    {
                        RowNumber = rowNumber,
                        ProductCode = code,
                        ProductName = name,
                        Reason = $"Invalid MRPPrice '{mrpStr}'. Must be a non-negative number."
                    });
                    continue;
                }

                decimal discountPct = 0;
                if (!string.IsNullOrWhiteSpace(discStr) && (!decimal.TryParse(discStr, out discountPct) || discountPct < 0 || discountPct > 100))
                {
                    result.FailedRecords.Add(new ProductImportRowErrorDto
                    {
                        RowNumber = rowNumber,
                        ProductCode = code,
                        ProductName = name,
                        Reason = $"Invalid DiscountPercentage '{discStr}'. Must be between 0 and 100."
                    });
                    continue;
                }

                int totalQty = 50;
                if (!string.IsNullOrWhiteSpace(qtyStr) && !int.TryParse(qtyStr, out totalQty))
                {
                    totalQty = 50;
                }

                bool isAvail = !string.Equals(availStr, "false", StringComparison.OrdinalIgnoreCase) && !string.Equals(availStr, "0", StringComparison.OrdinalIgnoreCase);
                bool isActive = !string.Equals(activeStr, "false", StringComparison.OrdinalIgnoreCase) && !string.Equals(activeStr, "0", StringComparison.OrdinalIgnoreCase);

                // Match or auto-create category
                string catKey = catName.Trim().ToLower();
                if (!categoryMap.TryGetValue(catKey, out int categoryId))
                {
                    var newCat = new Category
                    {
                        CategoryName = catName.Trim(),
                        Description = $"{catName.Trim()} Category",
                        IsActive = true,
                        CreatedDate = DateTime.UtcNow
                    };
                    _dbContext.Categories.Add(newCat);
                    await _dbContext.SaveChangesAsync();

                    categoryId = newCat.CategoryId;
                    categoryMap[catKey] = categoryId;
                }

                decimal discountPrice = CalculateDiscountPrice(mrpPrice, discountPct);

                var product = new Product
                {
                    ProductCode = code,
                    ProductName = name,
                    CategoryId = categoryId,
                    Description = desc,
                    MRPPrice = mrpPrice,
                    DiscountPercentage = discountPct,
                    DiscountPrice = discountPrice,
                    Price = discountPrice,
                    TotalQuantity = totalQty,
                    Unit = unit,
                    ImageUrl = string.IsNullOrWhiteSpace(imgUrl) ? "/assets/images/sparklers.jpg" : imgUrl,
                    IsAvailable = isAvail,
                    IsActive = isActive,
                    CreatedDate = DateTime.UtcNow
                };

                newProducts.Add(product);
                importCodes.Add(code.ToLower());
            }

            if (newProducts.Count > 0)
            {
                _dbContext.Products.AddRange(newProducts);
                await _dbContext.SaveChangesAsync();
            }

            result.TotalRecords = lines.Count - 1;
            result.SuccessfullyImported = newProducts.Count;
            result.FailedCount = result.FailedRecords.Count;

            return result;
        }

        private static decimal CalculateDiscountPrice(decimal mrp, decimal discountPct)
        {
            if (discountPct <= 0) return mrp;
            decimal calculated = mrp - (mrp * discountPct / 100m);
            return Math.Round(calculated, 2);
        }

        private static ProductDto MapToDto(Product p, Dictionary<int, string> categories)
        {
            var categoryName = categories.TryGetValue(p.CategoryId, out var name) ? name : "General";
            var mrp = p.MRPPrice > 0 ? p.MRPPrice : p.Price;
            var discPrice = p.DiscountPrice > 0 ? p.DiscountPrice : p.Price;

            var img = p.ImageUrl;
            var code = (p.ProductCode ?? "").Trim();
            var pName = (p.ProductName ?? "").Trim();

            if (code == "32" || pName.Contains("Free Fire", StringComparison.OrdinalIgnoreCase))
            {
                img = "/assets/images/5g-free-fire-gun.jpg";
            }
            else if (code == "33" || pName.Contains("Jackpot Currency", StringComparison.OrdinalIgnoreCase))
            {
                img = "/assets/images/jackpot-currency.jpg";
            }
            else if (string.IsNullOrWhiteSpace(img))
            {
                img = "/assets/images/sparklers.jpg";
            }

            return new ProductDto
            {
                ProductId = p.ProductId,
                ProductCode = p.ProductCode ?? "",
                ProductName = p.ProductName ?? "",
                CategoryId = p.CategoryId,
                CategoryName = categoryName,
                Description = p.Description,
                Price = p.Price,
                MRPPrice = mrp,
                DiscountPercentage = p.DiscountPercentage,
                DiscountPrice = discPrice,
                TotalQuantity = p.TotalQuantity,
                Unit = p.Unit,
                ImageUrl = img,
                IsAvailable = p.IsAvailable,
                IsActive = p.IsActive
            };
        }

        private static string GetCell(List<string> cells, int index, string fallback = "")
        {
            if (index >= 0 && index < cells.Count && !string.IsNullOrWhiteSpace(cells[index]))
            {
                return cells[index].Trim();
            }
            return fallback;
        }

        private static List<string> ParseCsvLine(string line, char delimiter = ',')
        {
            var result = new List<string>();
            var sb = new StringBuilder();
            bool inQuotes = false;

            for (int i = 0; i < line.Length; i++)
            {
                char c = line[i];
                if (c == '"')
                {
                    if (inQuotes && i + 1 < line.Length && line[i + 1] == '"')
                    {
                        sb.Append('"');
                        i++;
                    }
                    else
                    {
                        inQuotes = !inQuotes;
                    }
                }
                else if (c == delimiter && !inQuotes)
                {
                    result.Add(sb.ToString());
                    sb.Clear();
                }
                else
                {
                    sb.Append(c);
                }
            }
            result.Add(sb.ToString());
            return result;
        }
    }
}
