using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using KarthickCrackers.Api.Configuration;
using KarthickCrackers.Api.Data;
using KarthickCrackers.Api.Entities;

namespace KarthickCrackers.Api.Services
{
    public class EmailService : IEmailService
    {
        private readonly SmtpSettings _settings;
        private readonly ILogger<EmailService> _logger;
        private readonly ApplicationDbContext _dbContext;

                private static readonly HttpClient _httpClient = new HttpClient();
        

        public EmailService(IOptions<SmtpSettings> settings, ILogger<EmailService> logger, ApplicationDbContext dbContext)
        {
            _settings = settings.Value;
            _logger = logger;
            _dbContext = dbContext;
        }

        public async Task SendNewOrderAdminNotificationAsync(Order order, Customer customer, List<OrderItem> orderItems, byte[]? pdfBytes = null)
        {
            if (!_settings.Enabled)
            {
                _logger.LogInformation("Email notification is disabled in configuration.");
                return;
            }

            try
            {
                var subject = $"Order Confirmation - Order #{order.OrderNumber}";
                var bodyHtml = BuildNewOrderEmailHtml(order, customer, orderItems);

                var toList = new List<object>();
                
                if (!string.IsNullOrWhiteSpace(_settings.AdminEmail))
                {
                    toList.Add(new { email = _settings.AdminEmail.Trim(), name = "Admin" });
                }

                if (!string.IsNullOrWhiteSpace(customer.Email))
                {
                    var custEmail = customer.Email.Trim();
                    if (!custEmail.Equals(_settings.AdminEmail?.Trim(), StringComparison.OrdinalIgnoreCase))
                    {
                        toList.Add(new { email = custEmail, name = customer.FullName });
                    }
                }

                if (toList.Count == 0) return;

                var payload = new
                {
                    sender = new { name = _settings.SenderName ?? "Karthick Crackers", email = _settings.SenderEmail },
                    to = toList,
                    subject = subject,
                    htmlContent = bodyHtml,
                    attachment = pdfBytes != null ? new[] 
                    { 
                        new { name = $"Order_{order.OrderNumber}.pdf", content = Convert.ToBase64String(pdfBytes) } 
                    } : null
                };

                var jsonPayload = System.Text.Json.JsonSerializer.Serialize(payload, new System.Text.Json.JsonSerializerOptions { DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull });
                var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");
                
                var apiKey = _settings.Password;
                

                var request = new HttpRequestMessage(HttpMethod.Post, "https://api.brevo.com/v3/smtp/email");
                request.Headers.Add("api-key", apiKey);
                request.Headers.Add("accept", "application/json");
                request.Content = content;

                var response = await _httpClient.SendAsync(request);
                var responseBody = await response.Content.ReadAsStringAsync();

                if (response.IsSuccessStatusCode)
                {
                    _logger.LogInformation("Successfully sent email via Brevo API for Order {OrderNumber}.", order.OrderNumber);
                }
                else
                {
                    _logger.LogError("Brevo API failed for Order {OrderNumber}. Status: {StatusCode}, Body: {Body}", order.OrderNumber, response.StatusCode, responseBody);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email for Order {OrderNumber}", order.OrderNumber);
                throw;
            }
        }

        private string BuildNewOrderEmailHtml(Order order, Customer customer, List<OrderItem> items)
        {
            var callNumber = _dbContext.PaymentSettings.Select(p => p.CallNumber).FirstOrDefault();
            if (string.IsNullOrWhiteSpace(callNumber))
            {
                callNumber = "+91 6380891094";
            }

            var sb = new StringBuilder();
            var orderTimeIst = TimeZoneInfo.ConvertTimeFromUtc(
                order.OrderDate.Kind == DateTimeKind.Utc ? order.OrderDate : DateTime.SpecifyKind(order.OrderDate, DateTimeKind.Utc),
                TimeZoneInfo.FindSystemTimeZoneById("India Standard Time")
            );

            var formattedDate = orderTimeIst.ToString("dd MMM yyyy, hh:mm tt") + " IST";

            sb.Append(@"<!DOCTYPE html>
<html lang=""en"">
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>New Order Received</title>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 0; color: #333333; -webkit-font-smoothing: antialiased; }
        .wrapper { width: 100%; background-color: #f4f6f8; padding: 20px 0; }
        .container { max-width: 650px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08); border: 1px solid #e1e6eb; }
        .header { background: linear-gradient(135deg, #7A0000 0%, #B30000 100%); color: #ffffff; padding: 25px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px; }
        .header p { margin: 6px 0 0 0; font-size: 13px; color: #FFD700; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
        .status-badge-bar { background-color: #FFF8E7; border-bottom: 1px solid #FFE0B2; padding: 12px 30px; display: flex; justify-content: space-between; align-items: center; }
        .badge { background-color: #2e7d32; color: #ffffff; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
        .content { padding: 30px; }
        .section-title { font-size: 16px; font-weight: 700; color: #7A0000; margin-top: 0; margin-bottom: 14px; border-bottom: 2px solid #FFB800; padding-bottom: 6px; display: inline-block; }
        .details-grid { width: 100%; border-collapse: collapse; margin-bottom: 25px; background-color: #fafafa; border-radius: 6px; border: 1px solid #eeeeee; }
        .details-grid td { padding: 10px 14px; font-size: 14px; vertical-align: top; border-bottom: 1px solid #eeeeee; }
        .details-grid td.label { font-weight: 600; color: #555555; width: 35%; background-color: #f5f5f5; }
        .details-grid td.value { color: #111111; font-weight: 500; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 14px; }
        .items-table th { background-color: #7A0000; color: #ffffff; font-weight: 600; text-align: left; padding: 10px 12px; font-size: 13px; }
        .items-table td { padding: 12px; border-bottom: 1px solid #e0e0e0; }
        .items-table tr:nth-child(even) { background-color: #f9f9f9; }
        .items-table .num { text-align: right; }
        .summary-box { width: 100%; max-width: 300px; margin-left: auto; border-collapse: collapse; margin-bottom: 25px; font-size: 14px; }
        .summary-box td { padding: 8px 12px; }
        .summary-box td.label { text-align: right; font-weight: 600; color: #555555; }
        .summary-box td.val { text-align: right; color: #111111; font-weight: 600; }
        .summary-box tr.total-row td { font-size: 18px; font-weight: 800; color: #7A0000; border-top: 2px solid #7A0000; border-bottom: 2px solid #7A0000; padding: 12px; background-color: #FFF8E7; }
        .remarks-box { background-color: #fffde7; border-left: 4px solid #fbc02d; padding: 12px 16px; margin-bottom: 25px; border-radius: 0 4px 4px 0; font-size: 13px; color: #574300; }
        .footer { background-color: #1f1f1f; color: #aaaaaa; padding: 20px 30px; text-align: center; font-size: 12px; }
        .footer a { color: #FFB800; text-decoration: none; }
    </style>
</head>
<body>
    <div class=""wrapper"">
        <div class=""container"">
            <!-- Header -->
            <div class=""header"">
                <h1>KARTHICK CRACKERS</h1>
                <p>SIVAKASI · SINCE 2010</p>
            </div>
            
            <!-- Banner Bar -->
            <div class=""status-badge-bar"">
                <span style=""font-size: 15px; font-weight: 700; color: #7A0000;"">🚨 NEW ORDER RECEIVED</span>
                <span class=""badge"">" + order.OrderStatus.ToUpper() + @"</span>
            </div>

            <!-- Main Content -->
            <div class=""content"">
                <!-- Order & Customer Information -->
                <div class=""section-title"">ORDER &amp; CUSTOMER DETAILS</div>
                <table class=""details-grid"">
                    <tr>
                        <td class=""label"">Order Number</td>
                        <td class=""value""><strong style=""color: #7A0000; font-size: 15px;"">" + order.OrderNumber + @"</strong></td>
                    </tr>
                    <tr>
                        <td class=""label"">Order Date &amp; Time</td>
                        <td class=""value"">" + formattedDate + @"</td>
                    </tr>
                    <tr>
                        <td class=""label"">Customer Name</td>
                        <td class=""value""><strong>" + WebUtility.HtmlEncode(customer.FullName) + @"</strong></td>
                    </tr>
                    <tr>
                        <td class=""label"">Mobile Number</td>
                        <td class=""value""><a href=""tel:" + customer.MobileNumber + @""" style=""color: #7A0000; font-weight: 700; text-decoration: none;"">" + customer.MobileNumber + @"</a></td>
                    </tr>
                    <tr>
                        <td class=""label"">Customer Email</td>
                        <td class=""value"">" + (string.IsNullOrWhiteSpace(customer.Email) ? "<em>Not provided</em>" : $"<a href=\"mailto:{customer.Email}\">{WebUtility.HtmlEncode(customer.Email)}</a>") + @"</td>
                    </tr>
                    <tr>
                        <td class=""label"">Delivery Address</td>
                        <td class=""value"">" + WebUtility.HtmlEncode(customer.Address) + @", " + WebUtility.HtmlEncode(customer.City) + @" - " + WebUtility.HtmlEncode(customer.Pincode) + @"</td>
                    </tr>
                    <tr>
                        <td class=""label"">Payment Status</td>
                        <td class=""value""><span style=""color: #d32f2f; font-weight: 700;"">" + order.PaymentStatus + @" (UPI/Bank Transfer)</span></td>
                    </tr>
                </table>");

            if (!string.IsNullOrWhiteSpace(customer.Remarks))
            {
                sb.Append(@"
                <div class=""remarks-box"">
                    <strong>Customer Remarks / Instructions:</strong><br>
                    " + WebUtility.HtmlEncode(customer.Remarks) + @"
                </div>");
            }

            sb.Append(@"
                <!-- Ordered Products Table -->
                <div class=""section-title"">ORDERED ITEMS (" + items.Count + @")</div>
                <table class=""items-table"">
                    <thead>
                        <tr>
                            <th style=""width: 10%; text-align: center;"">Code</th>
                            <th style=""width: 50%;"">Product Name</th>
                            <th style=""width: 12%; text-align: center;"">Qty</th>
                            <th style=""width: 14%; text-align: right;"">Price</th>
                            <th style=""width: 14%; text-align: right;"">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>");

            foreach (var item in items)
            {
                sb.Append($@"
                        <tr>
                            <td style=""text-align: center; font-weight: 600; color: #555555;"">{WebUtility.HtmlEncode(item.ProductCode)}</td>
                            <td><strong style=""color: #222222;"">{WebUtility.HtmlEncode(item.ProductName)}</strong></td>
                            <td style=""text-align: center; font-weight: 700; color: #7A0000;"">{item.Quantity}</td>
                            <td class=""num"">₹{item.UnitPrice:N2}</td>
                            <td class=""num"" style=""font-weight: 600;"">₹{item.TotalPrice:N2}</td>
                        </tr>");
            }

            sb.Append(@"
                    </tbody>
                </table>

                <!-- Financial Summary Box -->
                <table class=""summary-box"">
                    <tr>
                        <td class=""label"">Subtotal:</td>
                        <td class=""val"">₹" + order.Subtotal.ToString("N2") + @"</td>
                    </tr>
                    <tr>
                        <td class=""label"">Delivery Charge:</td>
                        <td class=""val"">" + (order.DeliveryCharge > 0 ? $"₹{order.DeliveryCharge:N2}" : "FREE") + @"</td>
                    </tr>
                    <tr class=""total-row"">
                        <td class=""label"" style=""color: #7A0000;"">TOTAL AMOUNT:</td>
                        <td class=""val"" style=""color: #7A0000;"">₹" + order.TotalAmount.ToString("N2") + @"</td>
                    </tr>
                </table>
            </div>

            <!-- Footer -->
            <div class=""footer"">
                <p style=""margin: 0 0 6px 0; font-weight: 600; color: #ffffff;"">Karthick Crackers Admin Order Notification System</p>
                <p style=""margin: 0;"">3/347/U, Inthira Group House, Maraneri Village, Sivakasi - 626124 | Phone: " + WebUtility.HtmlEncode(callNumber) + @"</p>
            </div>
        </div>
    </div>
</body>
</html>");

            return sb.ToString();
        }
    }
}


