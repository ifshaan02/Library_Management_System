using System.ComponentModel.DataAnnotations;

namespace LibraryManagementSystem.API.DTOs
{
    public class CheckoutDto
    {
        [Required]
        public int BookId { get; set; }

        [Required]
        public int BorrowerId { get; set; }

        // Optional: number of days until due. Defaults to 14 in the service if not supplied.
        public int? LoanDurationDays { get; set; }
    }

    public class ReturnDto
    {
        [Required]
        public int LoanId { get; set; }
    }

    public class LoanReadDto
    {
        public int Id { get; set; }
        public int BookId { get; set; }
        public string BookTitle { get; set; } = string.Empty;
        public int BorrowerId { get; set; }
        public string BorrowerName { get; set; } = string.Empty;
        public DateTime LoanDate { get; set; }
        public DateTime DueDate { get; set; }
        public DateTime? ReturnDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public decimal FineAmount { get; set; }
    }
}
