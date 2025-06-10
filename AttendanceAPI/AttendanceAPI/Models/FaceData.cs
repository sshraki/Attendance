using System.ComponentModel.DataAnnotations;

namespace AttendanceAPI.Models
{
    public class FaceData
    {
        public Guid Id { get; set; }
        
        [Required]
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;
        
        [Required]
        public string FaceDescriptor { get; set; } = string.Empty; // Base64 encoded face descriptor
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}