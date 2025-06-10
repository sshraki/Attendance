using AttendanceAPI.Data;
using Microsoft.EntityFrameworkCore;

namespace AttendanceAPI.Services
{
    public class ReportService : IReportService
    {
        private readonly AttendanceDbContext _context;

        public ReportService(AttendanceDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<object>> GetAttendanceReportAsync(DateTime startDate, DateTime endDate, string? employeeId = null)
        {
            var query = _context.AttendanceRecords
                .Include(ar => ar.User)
                .Where(ar => ar.Date >= startDate.Date && ar.Date <= endDate.Date);

            if (!string.IsNullOrEmpty(employeeId))
            {
                query = query.Where(ar => ar.User.EmployeeId == employeeId);
            }

            var records = await query.ToListAsync();

            return records.Select(r => new
            {
                date = r.Date.ToString("yyyy-MM-dd"),
                employeeId = r.User.EmployeeId,
                employeeName = r.User.Name,
                department = r.User.Department,
                checkIn = r.CheckIn?.ToString("HH:mm") ?? "N/A",
                checkOut = r.CheckOut?.ToString("HH:mm") ?? "N/A",
                status = r.Status,
                isLate = r.IsLate,
                totalBreaks = r.Breaks.Count,
                breakTime = r.TotalBreakTime,
                workHours = r.TotalWorkHours
            });
        }

        public async Task<IEnumerable<object>> GetWorkHoursReportAsync(DateTime startDate, DateTime endDate, string? employeeId = null)
        {
            var query = _context.AttendanceRecords
                .Include(ar => ar.User)
                .Where(ar => ar.Date >= startDate.Date && ar.Date <= endDate.Date);

            if (!string.IsNullOrEmpty(employeeId))
            {
                query = query.Where(ar => ar.User.EmployeeId == employeeId);
            }

            var records = await query.ToListAsync();

            var groupedData = records
                .GroupBy(r => new { r.User.EmployeeId, r.User.Name, r.User.Department })
                .Select(g => new
                {
                    employeeId = g.Key.EmployeeId,
                    employeeName = g.Key.Name,
                    department = g.Key.Department,
                    totalDays = g.Count(),
                    totalWorkHours = g.Sum(r => r.TotalWorkHours),
                    totalBreakTime = g.Sum(r => r.TotalBreakTime),
                    lateDays = g.Count(r => r.IsLate),
                    averageWorkHours = g.Average(r => r.TotalWorkHours)
                });

            return groupedData;
        }

        public async Task<IEnumerable<object>> GetLeavesReportAsync(DateTime startDate, DateTime endDate, string? employeeId = null)
        {
            var query = _context.ApprovalRequests
                .Include(ar => ar.User)
                .Where(ar => ar.RequestedAt >= startDate && ar.RequestedAt <= endDate);

            if (!string.IsNullOrEmpty(employeeId))
            {
                query = query.Where(ar => ar.User.EmployeeId == employeeId);
            }

            var requests = await query.ToListAsync();

            return requests.Select(r => new
            {
                date = r.RequestedAt.ToString("yyyy-MM-dd"),
                employeeId = r.User.EmployeeId,
                employeeName = r.User.Name,
                type = r.Type,
                reason = r.Reason,
                status = r.Status,
                approvedBy = r.ApprovedBy ?? "N/A",
                approvedAt = r.ApprovedAt?.ToString("yyyy-MM-dd") ?? "N/A"
            });
        }
    }
}