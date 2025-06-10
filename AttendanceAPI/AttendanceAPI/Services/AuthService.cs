using AttendanceAPI.Data;
using AttendanceAPI.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace AttendanceAPI.Services
{
    public class AuthService : IAuthService
    {
        private readonly AttendanceDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(AttendanceDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<(User? user, string? token)> LoginAsync(string employeeId, string password)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.EmployeeId == employeeId && u.IsActive);

            if (user == null || !BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
            {
                return (null, null);
            }

            var token = GenerateJwtToken(user);
            return (user, token);
        }

        public async Task<User> CreateDefaultAdminAsync()
        {
            var existingAdmin = await _context.Users
                .FirstOrDefaultAsync(u => u.Role == "admin");

            if (existingAdmin != null)
            {
                return existingAdmin;
            }

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

            _context.Users.Add(adminUser);
            await _context.SaveChangesAsync();

            return adminUser;
        }

        public string GenerateJwtToken(User user)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var secretKey = jwtSettings["SecretKey"];
            var issuer = jwtSettings["Issuer"];
            var audience = jwtSettings["Audience"];
            var expiryInHours = int.Parse(jwtSettings["ExpiryInHours"]);

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Name),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim("EmployeeId", user.EmployeeId)
            };

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddHours(expiryInHours),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public async Task<User?> GetUserFromTokenAsync(string token)
        {
            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var jwtToken = tokenHandler.ReadJwtToken(token);
                
                var userIdClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
                {
                    return null;
                }

                return await _context.Users.FindAsync(userId);
            }
            catch
            {
                return null;
            }
        }
    }
}