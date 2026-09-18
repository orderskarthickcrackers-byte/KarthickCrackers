using System.Threading.Tasks;

namespace KarthickCrackers.Api.Services
{
    public interface IPdfExportService
    {
        Task<byte[]> GeneratePriceListPdfAsync(int? categoryId = null);
        Task<byte[]> GenerateOrderInvoicePdfAsync(int orderId);
        Task<byte[]> GenerateOrderInvoicePdfByNumberAsync(string orderNumber);
    }
}
