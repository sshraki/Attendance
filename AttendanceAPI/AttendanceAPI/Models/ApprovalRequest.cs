using System.ComponentModel.DataAnnotations;

namespace AttendanceAPI.Models
{
    public class ApprovalRequest
    {
        public Guid Id { get; set; }
        
        [Required]
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;
        
        [Required]
        [StringLength(20)]
        public string Type { get; set; } = string.Empty; // late, break, checkout
        
        [Required]
        public string Reason { get; set; } = string.Empty;
        
        [Required]
        [StringLength(20)]
        public string Status { get; set; } = "pending"; // pending, approved, rejected
        
        public DateTime RequestedAt { get; set; } = DateTime.UtcNow;
        
        public string? ApprovedBy { get; set; }
        public DateTime? ApprovedAt { get; set; }
    }
}