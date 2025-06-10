namespace AttendanceAPI.Services
{
    public interface IDashboardService
    {
        Task<object> GetDashboardStatsAsync();
    }
}