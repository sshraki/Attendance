using AttendanceAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AttendanceAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IUserService _userService;

        public AuthController(IAuthService authService, IUserService userService)
        {
            _authService = authService;
            _userService = userService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var (user, token) = await _authService.LoginAsync(request.EmployeeId, request.Password);
            
            if (user == null || token == null)
            {
                return Unauthorized(new { message = "Invalid credentials" });
            }

            return Ok(new { user, token });
        }

        [HttpPost("logout")]
        [Authorize]
        public IActionResult Logout()
        {
            // In a real implementation, you might want to blacklist the token
            return Ok(new { message = "Logged out successfully" });
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null || !Guid.TryParse(userId, out var userGuid))
            {
                return Unauthorized();
            }

            var user = await _userService.GetUserByIdAsync(userGuid);
            if (user == null)
            {
                return NotFound();
            }

            return Ok(user);
        }

        [HttpPost("create-default-admin")]
        public async Task<IActionResult> CreateDefaultAdmin()
        {
            var user = await _authService.CreateDefaultAdminAsync();
            var token = _authService.GenerateJwtToken(user);
            
            return Ok(new { user, token });
        }
    }

    public class LoginRequest
    {
        public string EmployeeId { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}