using LibraryManagementSystem.API.Data;
using LibraryManagementSystem.API.DTOs;
using LibraryManagementSystem.API.Models;
using LibraryManagementSystem.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LibraryManagementSystem.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ITokenService _tokenService;

        public AuthController(ApplicationDbContext context, ITokenService tokenService)
        {
            _context = context;
            _tokenService = tokenService;
        }

        [HttpPost("register")]
        [Authorize(Roles = "Admin")] // Only an existing admin can create new staff accounts
        public async Task<ActionResult<AuthResponseDto>> Register(RegisterDto dto)
        {
            if (await _context.Users.AnyAsync(u => u.Username == dto.Username || u.Email == dto.Email))
                return Conflict(new { message = "Username or email already in use." });

            var user = new User
            {
                Username = dto.Username,
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = dto.Role
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var (token, expiresAt) = _tokenService.GenerateToken(user);
            return Ok(new AuthResponseDto { Token = token, Username = user.Username, Role = user.Role.ToString(), ExpiresAt = expiresAt });
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<ActionResult<AuthResponseDto>> Login(LoginDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == dto.Username);

            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                return Unauthorized(new { message = "Invalid username or password." });

            var (token, expiresAt) = _tokenService.GenerateToken(user);
            return Ok(new AuthResponseDto { Token = token, Username = user.Username, Role = user.Role.ToString(), ExpiresAt = expiresAt });
        }

        [HttpPost("bootstrap-admin")]
        [AllowAnonymous]
        public async Task<ActionResult<AuthResponseDto>> BootstrapAdmin(RegisterDto dto)
        {
            // Convenience endpoint: only works if there are NO users yet at all (fresh install).
            if (await _context.Users.AnyAsync())
                return Forbid("An admin account already exists. Use /api/auth/register instead.");

            var user = new User
            {
                Username = dto.Username,
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = UserRole.Admin
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var (token, expiresAt) = _tokenService.GenerateToken(user);
            return Ok(new AuthResponseDto { Token = token, Username = user.Username, Role = user.Role.ToString(), ExpiresAt = expiresAt });
        }
    }
}
