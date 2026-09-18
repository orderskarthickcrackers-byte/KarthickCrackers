using System.Threading.Tasks;
using KarthickCrackers.Api.DTOs;

namespace KarthickCrackers.Api.Services
{
    public interface IDashboardService
    {
        Task<DashboardStatsDto> GetDashboardStatsAsync();
    }
}
