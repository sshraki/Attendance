using System.ComponentModel.DataAnnotations;

namespace AttendanceAPI.Models
{
    public class Settings
    {
        public Guid Id { get; set; }
        
        public int MaxBreakTime { get; set; } = 60; // minutes
        public int MaxLateTime { get; set; } = 15; // minutes
        public int MaxOvertime { get; set; } = 120; // minutes
        
        [Required]
        [StringLength(5)]
        public string MinCheckInTime { get; set; } = "08:00"; // HH:mm
        
        [Required]
        [StringLength(5)]
        public string MaxCheckInTime { get; set; } = "10:00"; // HH:mm
        
        [Required]
        [StringLength(5)]
        public string MinCheckOutTime { get; set; } = "16:00"; // HH:mm
        
        [Required]
        [StringLength(5)]
        public string MaxCheckOutTime { get; set; } = "20:00"; // HH:mm
        
        public int WorkingHoursPerDay { get; set; } = 8;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}