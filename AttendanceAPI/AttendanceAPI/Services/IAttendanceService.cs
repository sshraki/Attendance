using AttendanceAPI.Models;

namespace AttendanceAPI.Services
{
    public interface IAttendanceService
    {
        Task<IEnumerable<AttendanceRecord>> GetAttendanceRecordsAsync(DateTime? startDate = null, DateTime? endDate = null, string? employeeId = null);
        Task<AttendanceRecord?> GetTodayAttendanceAsync(string employeeId);
        Task<AttendanceRecord> CheckInAsync(string employeeId, string? faceData = null);
        Task<AttendanceRecord> CheckOutAsync(string employeeId, string? reason = null, string? type = null);
        Task<AttendanceRecord> StartBreakAsync(string employeeId);
        Task<AttendanceRecord> EndBreakAsync(string employeeId);
        Task<AttendanceRecord> CreateAttendanceRecordAsync(AttendanceRecord record);
        Task<AttendanceRecord> UpdateAttendanceRecordAsync(AttendanceRecord record);
    }
}