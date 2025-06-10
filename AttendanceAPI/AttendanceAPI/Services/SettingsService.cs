using AttendanceAPI.Data;
using AttendanceAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace AttendanceAPI.Services
{
    public class SettingsService : ISettingsService
    {
        private readonly AttendanceDbContext _context;

        public SettingsService(AttendanceDbContext context)
        {
            _context = context;
        }

        public async Task<Settings> GetSettingsAsync()
        {
            var settings = await _context.Settings.FirstOrDefaultAsync();
            if (settings == null)
            {
                // Create default settings if none exist
                settings = new Settings
                {
                    Id = Guid.NewGuid(),
                    MaxBreakTime = 60,
                    MaxLateTime = 15,
                    MaxOvertime = 120,
                    MinCheckInTime = "08:00",
                    MaxCheckInTime = "10:00",
                    MinCheckOutTime = "16:00",
                    MaxCheckOutTime = "20:00",
                    WorkingHoursPerDay = 8,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Settings.Add(settings);
                await _context.SaveChangesAsync();
            }

            return settings;
        }

        public async Task<Settings> UpdateSettingsAsync(Settings settings)
        {
            var existingSettings = await _context.Settings.FirstOrDefaultAsync();
            if (existingSettings == null)
            {
                settings.Id = Guid.NewGuid();
                settings.UpdatedAt = DateTime.UtcNow;
                _context.Settings.Add(settings);
            }
            else
            {
                existingSettings.MaxBreakTime = settings.MaxBreakTime;
                existingSettings.MaxLateTime = settings.MaxLateTime;
                existingSettings.MaxOvertime = settings.MaxOvertime;
                existingSettings.MinCheckInTime = settings.MinCheckInTime;
                existingSettings.MaxCheckInTime = settings.MaxCheckInTime;
                existingSettings.MinCheckOutTime = settings.MinCheckOutTime;
                existingSettings.MaxCheckOutTime = settings.MaxCheckOutTime;
                existingSettings.WorkingHoursPerDay = settings.WorkingHoursPerDay;
                existingSettings.UpdatedAt = DateTime.UtcNow;
                settings = existingSettings;
            }

            await _context.SaveChangesAsync();
            return settings;
        }
    }
}