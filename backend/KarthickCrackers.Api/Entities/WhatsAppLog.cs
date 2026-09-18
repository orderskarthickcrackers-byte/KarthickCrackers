using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KarthickCrackers.Api.Entities
{
    public class WhatsAppLog
    {
        [Key]
        public int Id { get; set; }

        public int OrderId { get; set; }

        public int CustomerId { get; set; }

        [Required]
        [MaxLength(20)]
        public string PhoneNumber { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string TemplateName { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? WhatsAppMessageId { get; set; }

        [Required]
        [MaxLength(50)]
        public string Status { get; set; } = "PENDING"; // SENT, FAILED, DUPLICATE_SKIPPED, PENDING

        public string? ErrorMessage { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? SentAt { get; set; }
    }
}
