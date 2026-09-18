namespace KarthickCrackers.Api.Services
{
    public interface IService
    {
        string GetHealthStatus();
    }

    public class BaseHealthService : IService
    {
        public string GetHealthStatus()
        {
            return "Karthick Crackers Web API is running smoothly.";
        }
    }
}
