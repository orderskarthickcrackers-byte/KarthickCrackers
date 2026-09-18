namespace KarthickCrackers.Api.Configuration
{
    public class SmtpSettings
    {
        public bool Enabled { get; set; } = true;
        public string Host { get; set; } = "smtp.gmail.com";
        public int Port { get; set; } = 587;
        public bool EnableSsl { get; set; } = true;
        public string SenderName { get; set; } = "Karthick Crackers Orders";
        public string SenderEmail { get; set; } = "orders.karthick.crackers@gmail.com";
        public string AdminEmail { get; set; } = "orders.karthick.crackers@gmail.com";
        public string Username { get; set; } = "orders.karthick.crackers@gmail.com";
        public string Password { get; set; } = "";
    }
}
