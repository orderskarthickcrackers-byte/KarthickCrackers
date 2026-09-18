using System.Threading.Tasks;
using KarthickCrackers.Api.Entities;

namespace KarthickCrackers.Api.Services
{
    public interface IWhatsAppService
    {
        Task<bool> SendOrderNotificationAsync(Order order, Customer customer, System.Collections.Generic.List<OrderItem> items);
        Task<bool> SendStatusUpdateNotificationAsync(Order order, Customer customer, string newStatus, string? remarks);
    }
}
