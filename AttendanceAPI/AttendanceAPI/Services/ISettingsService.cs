using AttendanceAPI.Models;

namespace AttendanceAPI.Services
{
    public interface ISettingsService
    {
        Task<Settings> GetSettingsAsync();
        Task<Settings> UpdateSettingsAsync(Settings settings);
    }
}