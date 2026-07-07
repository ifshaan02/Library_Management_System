using LibraryManagementSystem.API.Models;

namespace LibraryManagementSystem.API.Data
{
    public static class DbSeeder
    {
        public static void Seed(ApplicationDbContext context)
        {
            context.Database.EnsureCreated();

            if (!context.Users.Any())
            {
                context.Users.Add(new User
                {
                    Username = "admin",
                    Email = "admin@library.local",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                    Role = UserRole.Admin
                });
            }

            if (!context.Categories.Any())
            {
                context.Categories.AddRange(
                    new Category { Name = "Fiction" },
                    new Category { Name = "Non-Fiction" },
                    new Category { Name = "Science" },
                    new Category { Name = "Technology" },
                    new Category { Name = "History" },
                    new Category { Name = "Biography" }
                );
            }

            context.SaveChanges();
        }
    }
}
