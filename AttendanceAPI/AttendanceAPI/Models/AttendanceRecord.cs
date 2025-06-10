using System.ComponentModel.DataAnnotations;

namespace AttendanceAPI.Models
{
    public class AttendanceRecord
    {
        public Guid Id { get; set; }
        
        [Required]
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;
        
        [Required]
        public DateTime Date { get; set; }
        
        public DateTime? CheckIn { get; set; }
        public DateTime? CheckOut { get; set; }
        
        public decimal TotalWorkHours { get; set; }
        public int TotalBreakTime { get; set; } // in minutes
        
        public bool IsLate { get; set; }
        public string? LateReason { get; set; }
        public bool LateApproved { get; set; }
        
        public string? CheckoutReason { get; set; }
        public string? CheckoutType { get; set; }
        public bool CheckoutApproved { get; set; }
        
        [Required]
        [StringLength(20)]
        public string Status { get; set; } = "absent"; // present, absent, partial
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public ICollection<BreakRecord> Breaks { get; set; } = new List<BreakRecord>();
    }
}