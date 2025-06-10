using System.ComponentModel.DataAnnotations;

namespace AttendanceAPI.Models
{
    public class User
    {
        public Guid Id { get; set; }
        
        [Required]
        [StringLength(50)]
        public string EmployeeId { get; set; } = string.Empty;
        
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        [EmailAddress]
        [StringLength(100)]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        [StringLength(20)]
        public string Role { get; set; } = "employee"; // employee, manager, admin
        
        [Required]
        [StringLength(100)]
        public string Department { get; set; } = string.Empty;
        
        public Guid? ManagerId { get; set; }
        public User? Manager { get; set; }
        
        public string? PasswordHash { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public bool IsActive { get; set; } = true;
        
        // Navigation properties
        public ICollection<AttendanceRecord> AttendanceRecords { get; set; } = new List<AttendanceRecord>();
        public ICollection<ApprovalRequest> ApprovalRequests { get; set; } = new List<ApprovalRequest>();
        public ICollection<User> Subordinates { get; set; } = new List<User>();
        public FaceData? FaceData { get; set; }
    }
}