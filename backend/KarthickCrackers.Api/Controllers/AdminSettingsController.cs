using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using KarthickCrackers.Api.Data;
using KarthickCrackers.Api.DTOs;
using KarthickCrackers.Api.Entities;

using Microsoft.AspNetCore.Identity;

namespace KarthickCrackers.Api.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/admin/settings")]
    public class AdminSettingsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _env;
        private readonly IPasswordHasher<User> _passwordHasher;

        public AdminSettingsController(ApplicationDbContext context, IWebHostEnvironment env, IPasswordHasher<User> passwordHasher)
        {
            _context = context;
            _env = env;
            _passwordHasher = passwordHasher;
        }

        [HttpGet("payment")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPaymentSetting()
        {
            try
            {
                var setting = await _context.PaymentSettings.FirstOrDefaultAsync();
                if (setting == null)
                {
                    setting = new PaymentSetting
                    {
                        UpiId = "9952378965@upi",
                        UpiQrCodeUrl = "/assets/images/upi-qr.png",
                        CallNumber = "+91 6380891094"
                    };
                    _context.PaymentSettings.Add(setting);
                    await _context.SaveChangesAsync();
                }

                var dto = new PaymentSettingDto
                {
                    Id = setting.Id,
                    UpiId = setting.UpiId,
                    UpiQrCodeUrl = setting.UpiQrCodeUrl,
                    CallNumber = setting.CallNumber,
                    AccountHolder = setting.AccountHolder,
                    BankName = setting.BankName,
                    AccountNumber = setting.AccountNumber,
                    IfscCode = setting.IfscCode,
                    UpdatedAt = setting.UpdatedAt
                };

                return Ok(dto);
            }
            catch (Exception)
            {
                return Ok(new PaymentSettingDto
                {
                    Id = 1,
                    UpiId = "9952378965@upi",
                    UpiQrCodeUrl = "/assets/images/upi-qr.png",
                    CallNumber = "+91 6380891094"
                });
            }
        }

        [HttpPut("payment")]
        public async Task<IActionResult> UpdatePaymentSetting([FromBody] UpdatePaymentSettingDto dto)
        {
            var setting = await _context.PaymentSettings.FirstOrDefaultAsync();
            if (setting == null)
            {
                setting = new PaymentSetting();
                _context.PaymentSettings.Add(setting);
            }

            setting.UpiId = dto.UpiId;
            setting.CallNumber = dto.CallNumber;
            setting.AccountHolder = dto.AccountHolder;
            setting.BankName = dto.BankName;
            setting.AccountNumber = dto.AccountNumber;
            setting.IfscCode = dto.IfscCode;
            setting.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            var result = new PaymentSettingDto
            {
                Id = setting.Id,
                UpiId = setting.UpiId,
                UpiQrCodeUrl = setting.UpiQrCodeUrl,
                CallNumber = setting.CallNumber,
                AccountHolder = setting.AccountHolder,
                BankName = setting.BankName,
                AccountNumber = setting.AccountNumber,
                IfscCode = setting.IfscCode,
                UpdatedAt = setting.UpdatedAt
            };

            return Ok(result);
        }

        [HttpPost("payment/qr-code")]
        public async Task<IActionResult> UploadQrCode([FromForm] IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { message = "Please select a valid image file." });
            }

            var allowedExtensions = new[] { ".png", ".jpg", ".jpeg", ".webp" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (Array.IndexOf(allowedExtensions, extension) < 0)
            {
                return BadRequest(new { message = "Invalid file type. Only PNG, JPG, JPEG, WEBP allowed." });
            }

            var wwwroot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var uploadsFolder = Path.Combine(wwwroot, "uploads", "settings");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var fileName = $"upi-qr-{DateTime.UtcNow.Ticks}{extension}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Also update frontend assets directory if local development environment
            try
            {
                var frontendAssets = Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "frontend", "src", "assets", "images"));
                if (Directory.Exists(frontendAssets))
                {
                    var frontendFilePath = Path.Combine(frontendAssets, "upi-qr.png");
                    using (var stream = new FileStream(frontendFilePath, FileMode.Create))
                    {
                        await file.CopyToAsync(stream);
                    }
                }
            }
            catch
            {
                // Non-critical if frontend assets path not accessible in container
            }

            var qrCodeUrl = $"/uploads/settings/{fileName}";

            var setting = await _context.PaymentSettings.FirstOrDefaultAsync();
            if (setting == null)
            {
                setting = new PaymentSetting();
                _context.PaymentSettings.Add(setting);
            }

            setting.UpiQrCodeUrl = qrCodeUrl;
            setting.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { qrCodeUrl = qrCodeUrl, message = "QR Code updated successfully." });
        }

        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.CurrentPassword) || string.IsNullOrWhiteSpace(dto.NewPassword))
            {
                return BadRequest(new { message = "Current password and new password are required." });
            }

            if (dto.NewPassword != dto.ConfirmNewPassword)
            {
                return BadRequest(new { message = "New password and Confirm password do not match." });
            }

            if (dto.NewPassword.Length < 6)
            {
                return BadRequest(new { message = "New password must be at least 6 characters long." });
            }

            var adminUser = await _context.Users.FirstOrDefaultAsync(u => u.Role == "Admin" || u.Email == "karthickkumar2014000@gmail.com");
            if (adminUser == null)
            {
                return NotFound(new { message = "Admin account not found." });
            }

            var verification = _passwordHasher.VerifyHashedPassword(adminUser, adminUser.PasswordHash, dto.CurrentPassword);
            if (verification == PasswordVerificationResult.Failed)
            {
                return BadRequest(new { message = "Current password is incorrect." });
            }

            adminUser.PasswordHash = _passwordHasher.HashPassword(adminUser, dto.NewPassword);
            adminUser.Email = "karthickkumar2014000@gmail.com";
            adminUser.ModifiedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Admin password updated successfully!" });
        }
    }
}
