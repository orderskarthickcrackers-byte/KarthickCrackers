using Microsoft.AspNetCore.Mvc;
using KarthickCrackers.Api.DTOs;
using KarthickCrackers.Api.Services;

namespace KarthickCrackers.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HealthController : ControllerBase
    {
        private readonly IService _healthService;

        public HealthController(IService healthService)
        {
            _healthService = healthService;
        }

        [HttpGet]
        public IActionResult GetStatus()
        {
            var status = _healthService.GetHealthStatus();
            return Ok(ApiResponse<string>.SuccessResponse(status, "API Health check completed."));
        }
    }
}
