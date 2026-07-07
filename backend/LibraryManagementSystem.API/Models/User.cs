using System.ComponentModel.DataAnnotations;

namespace LibraryManagementSystem.API.Models
{
    public enum UserRole
    {
        Admin = 0,
        Librarian = 1
    }

    public class User
    {
        public int Id { get; set; }

        [Required, MaxLength(50)]
        public string Username { get; set; } = string.Empty;

        [Required, MaxLength(150), EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        public UserRole Role { get; set; } = UserRole.Librarian;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
