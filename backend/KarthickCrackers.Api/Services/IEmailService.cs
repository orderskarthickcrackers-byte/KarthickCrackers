using System.Collections.Generic;
using System.Threading.Tasks;
using KarthickCrackers.Api.Entities;

namespace KarthickCrackers.Api.Services
{
    public interface IEmailService
    {
        Task SendNewOrderAdminNotificationAsync(Order order, Customer customer, List<OrderItem> orderItems, byte[]? pdfBytes = null);
    }
}
