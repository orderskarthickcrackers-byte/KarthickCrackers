using System;
using KarthickCrackers.Api.Entities;

namespace KarthickCrackers.Api.Authentication
{
    public interface IJwtTokenGenerator
    {
        (string Token, DateTime ExpiresAt) GenerateToken(User user);
    }
}
