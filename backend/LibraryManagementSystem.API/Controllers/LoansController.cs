using LibraryManagementSystem.API.Data;
using LibraryManagementSystem.API.DTOs;
using LibraryManagementSystem.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LibraryManagementSystem.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class LoansController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private const decimal FinePerDay = 0.50m;
        private const int DefaultLoanDurationDays = 14;
        private const int MaxActiveLoansPerBorrower = 5;

        public LoansController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<LoanReadDto>>> GetAll([FromQuery] string? status)
        {
            var query = _context.Loans.Include(l => l.Book).Include(l => l.Borrower).AsQueryable();

            if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<LoanStatus>(status, true, out var parsedStatus))
                query = query.Where(l => l.Status == parsedStatus);

            var loans = await query
                .OrderByDescending(l => l.LoanDate)
                .ToListAsync();

            return Ok(loans.Select(ToDto));
        }

        [HttpGet("overdue")]
        public async Task<ActionResult<IEnumerable<LoanReadDto>>> GetOverdue()
        {
            var today = DateTime.UtcNow.Date;
            var overdue = await _context.Loans
                .Include(l => l.Book)
                .Include(l => l.Borrower)
                .Where(l => l.Status != LoanStatus.Returned && l.DueDate.Date < today)
                .OrderBy(l => l.DueDate)
                .ToListAsync();

            return Ok(overdue.Select(ToDto));
        }

        [HttpGet("borrower/{borrowerId}")]
        public async Task<ActionResult<IEnumerable<LoanReadDto>>> GetByBorrower(int borrowerId)
        {
            var loans = await _context.Loans
                .Include(l => l.Book)
                .Include(l => l.Borrower)
                .Where(l => l.BorrowerId == borrowerId)
                .OrderByDescending(l => l.LoanDate)
                .ToListAsync();

            return Ok(loans.Select(ToDto));
        }

        // POST: api/loans/checkout — issue a book to a borrower
        [HttpPost("checkout")]
        [Authorize(Roles = "Admin,Librarian")]
        public async Task<ActionResult<LoanReadDto>> Checkout(CheckoutDto dto)
        {
            await using var transaction = await _context.Database.BeginTransactionAsync();

            var book = await _context.Books.FindAsync(dto.BookId);
            if (book == null) return NotFound(new { message = "Book not found." });

            var borrower = await _context.Borrowers.FindAsync(dto.BorrowerId);
            if (borrower == null) return NotFound(new { message = "Borrower not found." });

            if (!borrower.IsActive)
                return BadRequest(new { message = "This borrower's membership is inactive." });

            if (book.AvailableCopies <= 0)
                return BadRequest(new { message = "No available copies of this book right now." });

            var activeLoanCount = await _context.Loans.CountAsync(l => l.BorrowerId == dto.BorrowerId && l.Status != LoanStatus.Returned);
            if (activeLoanCount >= MaxActiveLoansPerBorrower)
                return BadRequest(new { message = $"Borrower has reached the maximum of {MaxActiveLoansPerBorrower} active loans." });

            var alreadyHasThisBook = await _context.Loans.AnyAsync(l => l.BorrowerId == dto.BorrowerId && l.BookId == dto.BookId && l.Status != LoanStatus.Returned);
            if (alreadyHasThisBook)
                return BadRequest(new { message = "This borrower already has an active loan for this book." });

            var duration = dto.LoanDurationDays.GetValueOrDefault(DefaultLoanDurationDays);

            var loan = new Loan
            {
                BookId = dto.BookId,
                BorrowerId = dto.BorrowerId,
                LoanDate = DateTime.UtcNow,
                DueDate = DateTime.UtcNow.AddDays(duration),
                Status = LoanStatus.Active
            };

            book.AvailableCopies -= 1;

            _context.Loans.Add(loan);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            await _context.Entry(loan).Reference(l => l.Book).LoadAsync();
            await _context.Entry(loan).Reference(l => l.Borrower).LoadAsync();

            return CreatedAtAction(nameof(GetAll), new { id = loan.Id }, ToDto(loan));
        }

        // POST: api/loans/return — process a book return
        [HttpPost("return")]
        [Authorize(Roles = "Admin,Librarian")]
        public async Task<ActionResult<LoanReadDto>> Return(ReturnDto dto)
        {
            await using var transaction = await _context.Database.BeginTransactionAsync();

            var loan = await _context.Loans.Include(l => l.Book).Include(l => l.Borrower).FirstOrDefaultAsync(l => l.Id == dto.LoanId);
            if (loan == null) return NotFound(new { message = "Loan record not found." });

            if (loan.Status == LoanStatus.Returned)
                return BadRequest(new { message = "This loan has already been marked as returned." });

            loan.ReturnDate = DateTime.UtcNow;
            loan.Status = LoanStatus.Returned;

            if (loan.ReturnDate.Value.Date > loan.DueDate.Date)
            {
                var daysLate = (loan.ReturnDate.Value.Date - loan.DueDate.Date).Days;
                loan.FineAmount = daysLate * FinePerDay;
            }

            if (loan.Book != null)
                loan.Book.AvailableCopies += 1;

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return Ok(ToDto(loan));
        }

        // Utility endpoint: recalculates any loans that have silently gone overdue.
        // In a production system this would run as a scheduled background job.
        [HttpPost("refresh-overdue")]
        [Authorize(Roles = "Admin,Librarian")]
        public async Task<IActionResult> RefreshOverdueStatus()
        {
            var today = DateTime.UtcNow.Date;
            var loansToFlag = await _context.Loans
                .Where(l => l.Status == LoanStatus.Active && l.DueDate.Date < today)
                .ToListAsync();

            foreach (var loan in loansToFlag)
                loan.Status = LoanStatus.Overdue;

            await _context.SaveChangesAsync();
            return Ok(new { updated = loansToFlag.Count });
        }

        private static LoanReadDto ToDto(Loan l) => new()
        {
            Id = l.Id,
            BookId = l.BookId,
            BookTitle = l.Book?.Title ?? string.Empty,
            BorrowerId = l.BorrowerId,
            BorrowerName = l.Borrower?.FullName ?? string.Empty,
            LoanDate = l.LoanDate,
            DueDate = l.DueDate,
            ReturnDate = l.ReturnDate,
            Status = l.Status.ToString(),
            FineAmount = l.FineAmount
        };
    }
}
