using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using KarthickCrackers.Api.Authentication;
using KarthickCrackers.Api.Data;
using KarthickCrackers.Api.DTOs;
using KarthickCrackers.Api.Entities;

namespace KarthickCrackers.Api.Services
{
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly IJwtTokenGenerator _tokenGenerator;
        private readonly IPasswordHasher<User> _passwordHasher;

        public AuthService(
            ApplicationDbContext dbContext,
            IJwtTokenGenerator tokenGenerator,
            IPasswordHasher<User> passwordHasher)
        {
            _dbContext = dbContext;
            _tokenGenerator = tokenGenerator;
            _passwordHasher = passwordHasher;
        }

        public async Task<LoginResponseDto?> LoginAsync(LoginRequestDto request)
        {
            var targetEmail = request.Email.Trim().ToLower();
            if (targetEmail != "karthickkumar2014000@gmail.com")
            {
                // Only official admin email is allowed for admin login
                return null;
            }

            var user = await _dbContext.Users
                .FirstOrDefaultAsync(u => u.Email.ToLower() == targetEmail);

            if (user == null || !user.IsActive)
            {
                return null;
            }

            var verificationResult = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
            if (verificationResult == PasswordVerificationResult.Failed)
            {
                return null;
            }

            var (token, expiresAt) = _tokenGenerator.GenerateToken(user);

            return new LoginResponseDto
            {
                Token = token,
                UserId = user.UserId,
                Email = user.Email,
                Role = user.Role,
                ExpiresAt = expiresAt
            };
        }
    }
}
