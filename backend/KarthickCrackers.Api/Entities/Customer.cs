using System;
using System.ComponentModel.DataAnnotations;

namespace KarthickCrackers.Api.Entities
{
    public class Customer
    {
        [Key]
        public int CustomerId { get; set; }

        [Required]
        [MaxLength(150)]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string MobileNumber { get; set; } = string.Empty;

        [MaxLength(150)]
        public string? Email { get; set; }

        public string? Address { get; set; }

        [MaxLength(100)]
        public string? City { get; set; }

        [MaxLength(20)]
        public string? Pincode { get; set; }

        public string? Remarks { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public DateTime? ModifiedDate { get; set; }
    }
}
