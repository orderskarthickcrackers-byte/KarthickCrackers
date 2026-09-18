using System;

namespace KarthickCrackers.Api.Entities
{
    public class PaymentSetting
    {
        public int Id { get; set; }
        public string UpiId { get; set; } = "9952378965@upi";
        public string UpiQrCodeUrl { get; set; } = "/assets/images/upi-qr.png";
        public string CallNumber { get; set; } = "+91 6380891094";
        public string? AccountHolder { get; set; }
        public string? BankName { get; set; }
        public string? AccountNumber { get; set; }
        public string? IfscCode { get; set; }
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
