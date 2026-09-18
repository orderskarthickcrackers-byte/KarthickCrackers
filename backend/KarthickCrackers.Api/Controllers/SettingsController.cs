using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using KarthickCrackers.Api.Data;
using KarthickCrackers.Api.DTOs;
using KarthickCrackers.Api.Entities;

namespace KarthickCrackers.Api.Controllers
{
    [ApiController]
    [Route("api/settings")]
    public class SettingsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SettingsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("payment")]
        public async Task<IActionResult> GetPaymentSetting()
        {
            var setting = await _context.PaymentSettings.FirstOrDefaultAsync();
            if (setting == null)
            {
                setting = new PaymentSetting
                {
                    Id = 1,
                    UpiId = "9952378965@upi",
                    UpiQrCodeUrl = "/assets/images/upi-qr.png",
                    CallNumber = "+91 6380891094"
                };
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
    }
}
