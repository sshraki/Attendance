namespace AttendanceAPI.Services
{
    public interface IReportService
    {
        Task<IEnumerable<object>> GetAttendanceReportAsync(DateTime startDate, DateTime endDate, string? employeeId = null);
        Task<IEnumerable<object>> GetWorkHoursReportAsync(DateTime startDate, DateTime endDate, string? employeeId = null);
        Task<IEnumerable<object>> GetLeavesReportAsync(DateTime startDate, DateTime endDate, string? employeeId = null);
    }
}