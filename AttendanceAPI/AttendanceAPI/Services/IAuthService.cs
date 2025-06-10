using AttendanceAPI.Models;

namespace AttendanceAPI.Services
{
    public interface IAuthService
    {
        Task<(User? user, string? token)> LoginAsync(string employeeId, string password);
        Task<User> CreateDefaultAdminAsync();
        string GenerateJwtToken(User user);
        Task<User?> GetUserFromTokenAsync(string token);
    }
}