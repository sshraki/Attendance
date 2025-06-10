using AttendanceAPI.Data;
using Microsoft.EntityFrameworkCore;

namespace AttendanceAPI.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly AttendanceDbContext _context;

        public DashboardService(AttendanceDbContext context)
        {
            _context = context;
        }

        public async Task<object> GetDashboardStatsAsync()
        {
            var today = DateTime.Today;
            var users = await _context.Users.Where(u => u.IsActive).ToListAsync();
            var todayRecords = await _context.AttendanceRecords
                .Include(ar => ar.User)
                .Include(ar => ar.Breaks)
                .Where(ar => ar.Date.Date == today)
                .ToListAsync();

            var approvalRequests = await _context.ApprovalRequests
                .Include(ar => ar.User)
                .Where(ar => ar.Status == "pending")
                .ToListAsync();

            // Calculate stats
            var totalEmployees = users.Count;
            var presentToday = todayRecords.Count(r => r.Status == "present" || r.Status == "partial");
            var lateToday = todayRecords.Count(r => r.IsLate);
            var onBreak = todayRecords.Count(r => r.Breaks.Any(b => !b.EndTime.HasValue));
            var pendingApprovals = approvalRequests.Count;

            // Calculate average work hours for this week
            var weekStart = today.AddDays(-(int)today.DayOfWeek);
            var thisWeekRecords = await _context.AttendanceRecords
                .Where(ar => ar.Date >= weekStart)
                .ToListAsync();

            var avgWorkHours = thisWeekRecords.Any() 
                ? Math.Round(thisWeekRecords.Average(r => (double)r.TotalWorkHours), 1)
                : 0;

            // Recent activity
            var recentActivity = new List<object>();

            // Add recent attendance activities
            var recentAttendance = todayRecords
                .OrderByDescending(r => r.CheckOut ?? r.CheckIn ?? r.CreatedAt)
                .Take(5)
                .Select(r => new
                {
                    type = "attendance",
                    message = $"{r.User.Name} checked {(r.CheckOut.HasValue ? "out" : "in")}",
                    time = r.CheckOut ?? r.CheckIn ?? r.CreatedAt,
                    user = r.User.Name
                });

            recentActivity.AddRange(recentAttendance);

            // Add recent approval requests
            var recentApprovals = approvalRequests
                .OrderByDescending(r => r.RequestedAt)
                .Take(3)
                .Select(r => new
                {
                    type = "approval",
                    message = $"{r.User.Name} requested {r.Type} approval",
                    time = r.RequestedAt,
                    user = r.User.Name
                });

            recentActivity.AddRange(recentApprovals);

            // Sort and limit recent activity
            var sortedActivity = recentActivity
                .OrderByDescending(a => a.time)
                .Take(8)
                .ToList();

            return new
            {
                totalEmployees,
                presentToday,
                lateToday,
                onBreak,
                pendingApprovals,
                avgWorkHours,
                recentActivity = sortedActivity
            };
        }
    }
}