using System.ComponentModel.DataAnnotations;

namespace LibraryManagementSystem.API.DTOs
{
    public class BorrowerCreateDto
    {
        [Required, MaxLength(150)]
        public string FullName { get; set; } = string.Empty;

        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;

        public string? Phone { get; set; }

        public string? Address { get; set; }
    }

    public class BorrowerUpdateDto : BorrowerCreateDto
    {
        public bool IsActive { get; set; } = true;
    }

    public class BorrowerReadDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? Address { get; set; }
        public DateTime MembershipDate { get; set; }
        public bool IsActive { get; set; }
        public int ActiveLoanCount { get; set; }
    }
}
