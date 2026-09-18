using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using KarthickCrackers.Api.Data;
using KarthickCrackers.Api.Entities;

namespace KarthickCrackers.Api.Services
{
    public class WhatsAppService : IWhatsAppService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<WhatsAppService> _logger;

        public WhatsAppService(
            HttpClient httpClient,
            IConfiguration configuration,
            IServiceProvider serviceProvider,
            ILogger<WhatsAppService> logger)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        public async Task<bool> SendOrderNotificationAsync(Order order, Customer customer, List<OrderItem> items)
        {
            using var scope = _serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var enabled = _configuration.GetValue<bool>("MetaWhatsAppConfig:Enabled", true);
            var apiVersion = _configuration["MetaWhatsAppConfig:ApiVersion"] ?? "v19.0";
            var phoneNumberId = _configuration["MetaWhatsAppConfig:PhoneNumberId"] ?? "YOUR_META_PHONE_NUMBER_ID";
            var accessToken = _configuration["MetaWhatsAppConfig:AccessToken"] ?? "YOUR_META_ACCESS_TOKEN";
            var templateName = _configuration["MetaWhatsAppConfig:TemplateName"] ?? "order_confirmation";
            var languageCode = _configuration["MetaWhatsAppConfig:LanguageCode"] ?? "en_US";

            var cleanPhone = FormatPhoneNumber(customer.MobileNumber);

            // 1. DEDUPLICATION CHECK: Check if WhatsApp notification already sent for this Order & Template
            var existingLog = await dbContext.WhatsAppLogs
                .FirstOrDefaultAsync(l => l.OrderId == order.OrderId && l.TemplateName == templateName && l.Status == "SENT");

            if (existingLog != null)
            {
                _logger.LogInformation("DEDUPLICATION: WhatsApp notification already sent for Order #{OrderNumber} (Message ID: {MsgId}). Skipping duplicate dispatch.",
                    order.OrderNumber, existingLog.WhatsAppMessageId);

                var duplicateLog = new WhatsAppLog
                {
                    OrderId = order.OrderId,
                    CustomerId = customer.CustomerId,
                    PhoneNumber = cleanPhone,
                    TemplateName = templateName,
                    Status = "DUPLICATE_SKIPPED",
                    ErrorMessage = "Duplicate notification skipped for order",
                    CreatedAt = DateTime.UtcNow
                };
                dbContext.WhatsAppLogs.Add(duplicateLog);
                await dbContext.SaveChangesAsync();

                return true;
            }

            // Create initial pending log record
            var log = new WhatsAppLog
            {
                OrderId = order.OrderId,
                CustomerId = customer.CustomerId,
                PhoneNumber = cleanPhone,
                TemplateName = templateName,
                Status = "PENDING",
                CreatedAt = DateTime.UtcNow
            };
            dbContext.WhatsAppLogs.Add(log);
            await dbContext.SaveChangesAsync();

            if (!enabled)
            {
                _logger.LogWarning("Meta WhatsApp Cloud API is disabled in configuration.");
                log.Status = "FAILED";
                log.ErrorMessage = "Meta WhatsApp integration disabled in appsettings.json";
                await dbContext.SaveChangesAsync();
                return false;
            }

            try
            {
                // 2. BUILD META WHATSAPP CLOUD API PAYLOAD
                // Body Template parameters: {{1}} = Customer Name, {{2}} = Order Number, {{3}} = Total Amount
                var payload = new
                {
                    messaging_product = "whatsapp",
                    recipient_type = "individual",
                    to = cleanPhone,
                    type = "template",
                    template = new
                    {
                        name = templateName,
                        language = new
                        {
                            code = languageCode
                        },
                        components = new[]
                        {
                            new
                            {
                                type = "body",
                                parameters = new[]
                                {
                                    new { type = "text", text = customer.FullName },
                                    new { type = "text", text = order.OrderNumber },
                                    new { type = "text", text = order.TotalAmount.ToString("N2") }
                                }
                            }
                        }
                    }
                };

                var requestUrl = $"https://graph.facebook.com/{apiVersion}/{phoneNumberId}/messages";
                var jsonBody = JsonSerializer.Serialize(payload);

                _logger.LogInformation("=================================================");
                _logger.LogInformation("META WHATSAPP CLOUD API REQUEST to {Phone}", cleanPhone);
                _logger.LogInformation("URL: {Url}", requestUrl);
                _logger.LogInformation("PAYLOAD:\n{Payload}", jsonBody);
                _logger.LogInformation("=================================================");

                var request = new HttpRequestMessage(HttpMethod.Post, requestUrl)
                {
                    Content = new StringContent(jsonBody, Encoding.UTF8, "application/json")
                };
                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

                var response = await _httpClient.SendAsync(request);
                var responseString = await response.Content.ReadAsStringAsync();

                _logger.LogInformation("Meta API Response HTTP Status ({StatusCode}): {ResponseBody}", response.StatusCode, responseString);

                if (response.IsSuccessStatusCode)
                {
                    string? waMsgId = null;
                    try
                    {
                        using var doc = JsonDocument.Parse(responseString);
                        if (doc.RootElement.TryGetProperty("messages", out var messagesArr) && messagesArr.GetArrayLength() > 0)
                        {
                            waMsgId = messagesArr[0].GetProperty("id").GetString();
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning("Could not parse WhatsApp message ID from response: {Error}", ex.Message);
                    }

                    log.Status = "SENT";
                    log.WhatsAppMessageId = waMsgId ?? "META_SUCCESS";
                    log.SentAt = DateTime.UtcNow;
                    log.ErrorMessage = null;
                    await dbContext.SaveChangesAsync();

                    _logger.LogInformation("WhatsApp message successfully dispatched via Meta API. Message ID: {WaMsgId}", waMsgId);
                    return true;
                }
                else
                {
                    log.Status = "FAILED";
                    log.ErrorMessage = $"Meta API Error ({response.StatusCode}): {responseString}";
                    await dbContext.SaveChangesAsync();

                    _logger.LogError("Failed to send WhatsApp message via Meta Cloud API. Status: {StatusCode}, Error: {Error}", response.StatusCode, responseString);
                    return false;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception encountered while calling Meta WhatsApp Cloud API.");
                log.Status = "FAILED";
                log.ErrorMessage = ex.Message;
                await dbContext.SaveChangesAsync();
                return false;
            }
        }

        public async Task<bool> SendStatusUpdateNotificationAsync(Order order, Customer customer, string newStatus, string? remarks)
        {
            using var scope = _serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var apiVersion = _configuration["MetaWhatsAppConfig:ApiVersion"] ?? "v19.0";
            var phoneNumberId = _configuration["MetaWhatsAppConfig:PhoneNumberId"] ?? "YOUR_META_PHONE_NUMBER_ID";
            var accessToken = _configuration["MetaWhatsAppConfig:AccessToken"] ?? "YOUR_META_ACCESS_TOKEN";
            var templateName = "order_status_update";
            var languageCode = _configuration["MetaWhatsAppConfig:LanguageCode"] ?? "en_US";

            var cleanPhone = FormatPhoneNumber(customer.MobileNumber);

            var log = new WhatsAppLog
            {
                OrderId = order.OrderId,
                CustomerId = customer.CustomerId,
                PhoneNumber = cleanPhone,
                TemplateName = templateName,
                Status = "PENDING",
                CreatedAt = DateTime.UtcNow
            };
            dbContext.WhatsAppLogs.Add(log);
            await dbContext.SaveChangesAsync();

            try
            {
                var payload = new
                {
                    messaging_product = "whatsapp",
                    recipient_type = "individual",
                    to = cleanPhone,
                    type = "template",
                    template = new
                    {
                        name = templateName,
                        language = new { code = languageCode },
                        components = new[]
                        {
                            new
                            {
                                type = "body",
                                parameters = new[]
                                {
                                    new { type = "text", text = customer.FullName },
                                    new { type = "text", text = order.OrderNumber },
                                    new { type = "text", text = newStatus.ToUpper() }
                                }
                            }
                        }
                    }
                };

                var requestUrl = $"https://graph.facebook.com/{apiVersion}/{phoneNumberId}/messages";
                var jsonBody = JsonSerializer.Serialize(payload);

                var request = new HttpRequestMessage(HttpMethod.Post, requestUrl)
                {
                    Content = new StringContent(jsonBody, Encoding.UTF8, "application/json")
                };
                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

                var response = await _httpClient.SendAsync(request);
                var responseString = await response.Content.ReadAsStringAsync();

                if (response.IsSuccessStatusCode)
                {
                    log.Status = "SENT";
                    log.SentAt = DateTime.UtcNow;
                    await dbContext.SaveChangesAsync();
                    return true;
                }
                else
                {
                    log.Status = "FAILED";
                    log.ErrorMessage = $"Meta API Error ({response.StatusCode}): {responseString}";
                    await dbContext.SaveChangesAsync();
                    return false;
                }
            }
            catch (Exception ex)
            {
                log.Status = "FAILED";
                log.ErrorMessage = ex.Message;
                await dbContext.SaveChangesAsync();
                return false;
            }
        }

        private static string FormatPhoneNumber(string phone)
        {
            var clean = phone.Replace("+", "").Replace(" ", "").Replace("-", "");
            if (!clean.StartsWith("91") && clean.Length == 10)
            {
                clean = "91" + clean;
            }
            return clean;
        }
    }
}
