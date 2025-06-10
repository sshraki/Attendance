using AttendanceAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace AttendanceAPI.Data
{
    public static class SeedData
    {
        public static async Task Initialize(IServiceProvider serviceProvider)
        {
            using var context = new AttendanceDbContext(
                serviceProvider.GetRequiredService<DbContextOptions<AttendanceDbContext>>());

            // Check if data already exists
            if (context.Users.Any())
            {
                return; // DB has been seeded
            }

            // Create default settings
            var settings = new Settings
            {
                Id = Guid.NewGuid(),
                MaxBreakTime = 60,
                MaxLateTime = 15,
                MaxOvertime = 120,
                MinCheckInTime = "08:00",
                MaxCheckInTime = "10:00",
                MinCheckOutTime = "16:00",
                MaxCheckOutTime = "20:00",
                WorkingHoursPerDay = 8
            };

            context.Settings.Add(settings);

            // Create default admin user
            var adminUser = new User
            {
                Id = Guid.NewGuid(),
                EmployeeId = "ADMIN001",
                Name = "System Administrator",
                Email = "admin@company.com",
                Role = "admin",
                Department = "IT",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            context.Users.Add(adminUser);

            // Create sample manager
            var manager = new User
            {
                Id = Guid.NewGuid(),
                EmployeeId = "MGR001",
                Name = "John Manager",
                Email = "john.manager@company.com",
                Role = "manager",
                Department = "Operations",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("manager123"),
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            context.Users.Add(manager);

            // Create sample employee
            var employee = new User
            {
                Id = Guid.NewGuid(),
                EmployeeId = "EMP001",
                Name = "Jane Employee",
                Email = "jane.employee@company.com",
                Role = "employee",
                Department = "Operations",
                ManagerId = manager.Id,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("employee123"),
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            context.Users.Add(employee);

            await context.SaveChangesAsync();
        }
    }
}