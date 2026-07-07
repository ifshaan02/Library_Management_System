using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LibraryManagementSystem.API.Models
{
    public enum LoanStatus
    {
        Active = 0,
        Returned = 1,
        Overdue = 2
    }

    public class Loan
    {
        public int Id { get; set; }

        public int BookId { get; set; }

        [ForeignKey(nameof(BookId))]
        public Book? Book { get; set; }

        public int BorrowerId { get; set; }

        [ForeignKey(nameof(BorrowerId))]
        public Borrower? Borrower { get; set; }

        public DateTime LoanDate { get; set; } = DateTime.UtcNow;

        public DateTime DueDate { get; set; }

        public DateTime? ReturnDate { get; set; }

        public LoanStatus Status { get; set; } = LoanStatus.Active;

        [Column(TypeName = "decimal(10,2)")]
        public decimal FineAmount { get; set; } = 0;
    }
}
