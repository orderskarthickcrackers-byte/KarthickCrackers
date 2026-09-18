using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using KarthickCrackers.Api.DTOs;
using KarthickCrackers.Api.Services;

namespace KarthickCrackers.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var response = await _authService.LoginAsync(request);
            if (response == null)
            {
                return Unauthorized(new { message = "Invalid email or password." });
            }

            return Ok(response);
        }

        [Authorize]
        [HttpGet("me")]
        public IActionResult GetCurrentUser()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
            var email = User.FindFirstValue(ClaimTypes.Email) ?? string.Empty;
            var role = User.FindFirstValue(ClaimTypes.Role) ?? string.Empty;

            if (!int.TryParse(userIdStr, out int userId))
            {
                return Unauthorized(new { message = "Invalid token claims." });
            }

            return Ok(new UserInfoDto
            {
                UserId = userId,
                Email = email,
                Role = role
            });
        }
    }
}
