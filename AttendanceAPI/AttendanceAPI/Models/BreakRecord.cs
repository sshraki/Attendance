using System.ComponentModel.DataAnnotations;

namespace AttendanceAPI.Models
{
    public class BreakRecord
    {
        public Guid Id { get; set; }
        
        [Required]
        public Guid AttendanceRecordId { get; set; }
        public AttendanceRecord AttendanceRecord { get; set; } = null!;
        
        [Required]
        public DateTime StartTime { get; set; }
        
        public DateTime? EndTime { get; set; }
        
        public int Duration { get; set; } // in minutes
        
        public string? Reason { get; set; }
        
        public bool Approved { get; set; } = true;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}