using AttendanceAPI.Data;
using AttendanceAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace AttendanceAPI.Services
{
    public class AttendanceService : IAttendanceService
    {
        private readonly AttendanceDbContext _context;
        private readonly ISettingsService _settingsService;

        public AttendanceService(AttendanceDbContext context, ISettingsService settingsService)
        {
            _context = context;
            _settingsService = settingsService;
        }

        public async Task<IEnumerable<AttendanceRecord>> GetAttendanceRecordsAsync(DateTime? startDate = null, DateTime? endDate = null, string? employeeId = null)
        {
            var query = _context.AttendanceRecords
                .Include(ar => ar.User)
                .Include(ar => ar.Breaks)
                .AsQueryable();

            if (startDate.HasValue)
            {
                query = query.Where(ar => ar.Date >= startDate.Value.Date);
            }

            if (endDate.HasValue)
            {
                query = query.Where(ar => ar.Date <= endDate.Value.Date);
            }

            if (!string.IsNullOrEmpty(employeeId))
            {
                query = query.Where(ar => ar.User.EmployeeId == employeeId);
            }

            return await query.OrderByDescending(ar => ar.Date).ToListAsync();
        }

        public async Task<AttendanceRecord?> GetTodayAttendanceAsync(string employeeId)
        {
            var today = DateTime.Today;
            var user = await _context.Users.FirstOrDefaultAsync(u => u.EmployeeId == employeeId);
            
            if (user == null) return null;

            return await _context.AttendanceRecords
                .Include(ar => ar.Breaks)
                .FirstOrDefaultAsync(ar => ar.UserId == user.Id && ar.Date.Date == today);
        }

        public async Task<AttendanceRecord> CheckInAsync(string employeeId, string? faceData = null)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.EmployeeId == employeeId);
            if (user == null)
            {
                throw new ArgumentException("User not found");
            }

            var today = DateTime.Today;
            var now = DateTime.UtcNow;
            var settings = await _settingsService.GetSettingsAsync();

            var existingRecord = await GetTodayAttendanceAsync(employeeId);
            if (existingRecord != null)
            {
                throw new InvalidOperationException("Already checked in today");
            }

            var isLate = IsLateArrival(now, settings.MinCheckInTime, settings.MaxLateTime);

            var record = new AttendanceRecord
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                Date = today,
                CheckIn = now,
                IsLate = isLate,
                LateApproved = !isLate,
                Status = "present",
                CreatedAt = now,
                UpdatedAt = now
            };

            _context.AttendanceRecords.Add(record);
            await _context.SaveChangesAsync();

            return record;
        }

        public async Task<AttendanceRecord> CheckOutAsync(string employeeId, string? reason = null, string? type = null)
        {
            var record = await GetTodayAttendanceAsync(employeeId);
            if (record == null)
            {
                throw new InvalidOperationException("No check-in record found for today");
            }

            if (record.CheckOut.HasValue)
            {
                throw new InvalidOperationException("Already checked out today");
            }

            var now = DateTime.UtcNow;
            record.CheckOut = now;
            record.CheckoutReason = reason;
            record.CheckoutType = type;
            record.UpdatedAt = now;

            // Calculate work hours
            if (record.CheckIn.HasValue)
            {
                var workTime = now - record.CheckIn.Value;
                var breakTime = record.Breaks.Sum(b => b.Duration);
                record.TotalWorkHours = (decimal)(workTime.TotalHours - (breakTime / 60.0));
                record.TotalBreakTime = breakTime;
            }

            await _context.SaveChangesAsync();
            return record;
        }

        public async Task<AttendanceRecord> StartBreakAsync(string employeeId)
        {
            var record = await GetTodayAttendanceAsync(employeeId);
            if (record == null)
            {
                throw new InvalidOperationException("No check-in record found for today");
            }

            var lastBreak = record.Breaks.OrderByDescending(b => b.StartTime).FirstOrDefault();
            if (lastBreak != null && !lastBreak.EndTime.HasValue)
            {
                throw new InvalidOperationException("Already on break");
            }

            var breakRecord = new BreakRecord
            {
                Id = Guid.NewGuid(),
                AttendanceRecordId = record.Id,
                StartTime = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            };

            _context.BreakRecords.Add(breakRecord);
            await _context.SaveChangesAsync();

            // Reload the record with breaks
            return await GetTodayAttendanceAsync(employeeId) ?? record;
        }

        public async Task<AttendanceRecord> EndBreakAsync(string employeeId)
        {
            var record = await GetTodayAttendanceAsync(employeeId);
            if (record == null)
            {
                throw new InvalidOperationException("No check-in record found for today");
            }

            var lastBreak = record.Breaks.OrderByDescending(b => b.StartTime).FirstOrDefault();
            if (lastBreak == null || lastBreak.EndTime.HasValue)
            {
                throw new InvalidOperationException("Not currently on break");
            }

            var now = DateTime.UtcNow;
            lastBreak.EndTime = now;
            lastBreak.Duration = (int)(now - lastBreak.StartTime).TotalMinutes;

            record.UpdatedAt = now;
            record.TotalBreakTime = record.Breaks.Sum(b => b.Duration);

            await _context.SaveChangesAsync();
            return record;
        }

        public async Task<AttendanceRecord> CreateAttendanceRecordAsync(AttendanceRecord record)
        {
            record.Id = Guid.NewGuid();
            record.CreatedAt = DateTime.UtcNow;
            record.UpdatedAt = DateTime.UtcNow;

            _context.AttendanceRecords.Add(record);
            await _context.SaveChangesAsync();

            return record;
        }

        public async Task<AttendanceRecord> UpdateAttendanceRecordAsync(AttendanceRecord record)
        {
            record.UpdatedAt = DateTime.UtcNow;
            _context.AttendanceRecords.Update(record);
            await _context.SaveChangesAsync();

            return record;
        }

        private bool IsLateArrival(DateTime checkInTime, string minTime, int maxLateMinutes)
        {
            var checkInMinutes = checkInTime.Hour * 60 + checkInTime.Minute;
            var minMinutes = TimeStringToMinutes(minTime);
            return checkInMinutes > (minMinutes + maxLateMinutes);
        }

        private int TimeStringToMinutes(string timeString)
        {
            var parts = timeString.Split(':');
            return int.Parse(parts[0]) * 60 + int.Parse(parts[1]);
        }
    }
}