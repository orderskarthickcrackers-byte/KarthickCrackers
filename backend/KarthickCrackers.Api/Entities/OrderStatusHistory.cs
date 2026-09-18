using System;
using System.ComponentModel.DataAnnotations;

namespace KarthickCrackers.Api.Entities
{
    public class OrderStatusHistory
    {
        [Key]
        public int OrderStatusHistoryId { get; set; }

        // Stores Orders.OrderId value without SQL FK constraint
        public int OrderId { get; set; }

        [MaxLength(50)]
        public string? OldStatus { get; set; }

        [Required]
        [MaxLength(50)]
        public string NewStatus { get; set; } = string.Empty;

        public DateTime ChangedDate { get; set; } = DateTime.UtcNow;

        public string? Remarks { get; set; }
    }
}
