using System.Threading.Tasks;
using KarthickCrackers.Api.DTOs;

namespace KarthickCrackers.Api.Services
{
    public interface IAuthService
    {
        Task<LoginResponseDto?> LoginAsync(LoginRequestDto request);
    }
}
