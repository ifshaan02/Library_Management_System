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
    public class BooksController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public BooksController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/books?search=&categoryId=&page=1&pageSize=10
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<object>> GetAll(
            [FromQuery] string? search,
            [FromQuery] int? categoryId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var query = _context.Books.Include(b => b.Category).AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim().ToLower();
                query = query.Where(b =>
                    b.Title.ToLower().Contains(term) ||
                    b.Author.ToLower().Contains(term) ||
                    b.ISBN.ToLower().Contains(term));
            }

            if (categoryId.HasValue)
                query = query.Where(b => b.CategoryId == categoryId.Value);

            var totalCount = await query.CountAsync();

            var books = await query
                .OrderBy(b => b.Title)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(b => new BookReadDto
                {
                    Id = b.Id,
                    Title = b.Title,
                    Author = b.Author,
                    ISBN = b.ISBN,
                    Publisher = b.Publisher,
                    PublishedYear = b.PublishedYear,
                    CategoryId = b.CategoryId,
                    CategoryName = b.Category != null ? b.Category.Name : null,
                    TotalCopies = b.TotalCopies,
                    AvailableCopies = b.AvailableCopies,
                    CoverImageUrl = b.CoverImageUrl
                })
                .ToListAsync();

            return Ok(new { totalCount, page, pageSize, items = books });
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<BookReadDto>> GetById(int id)
        {
            var book = await _context.Books.Include(b => b.Category).FirstOrDefaultAsync(b => b.Id == id);
            if (book == null) return NotFound();

            return Ok(new BookReadDto
            {
                Id = book.Id,
                Title = book.Title,
                Author = book.Author,
                ISBN = book.ISBN,
                Publisher = book.Publisher,
                PublishedYear = book.PublishedYear,
                CategoryId = book.CategoryId,
                CategoryName = book.Category?.Name,
                TotalCopies = book.TotalCopies,
                AvailableCopies = book.AvailableCopies,
                CoverImageUrl = book.CoverImageUrl
            });
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Librarian")]
        public async Task<ActionResult<BookReadDto>> Create(BookCreateDto dto)
        {
            if (await _context.Books.AnyAsync(b => b.ISBN == dto.ISBN))
                return Conflict(new { message = "A book with this ISBN already exists." });

            var categoryExists = await _context.Categories.AnyAsync(c => c.Id == dto.CategoryId);
            if (!categoryExists) return BadRequest(new { message = "Invalid category." });

            var book = new Book
            {
                Title = dto.Title,
                Author = dto.Author,
                ISBN = dto.ISBN,
                Publisher = dto.Publisher,
                PublishedYear = dto.PublishedYear,
                CategoryId = dto.CategoryId,
                TotalCopies = dto.TotalCopies,
                AvailableCopies = dto.TotalCopies,
                CoverImageUrl = dto.CoverImageUrl
            };

            _context.Books.Add(book);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = book.Id }, book);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Librarian")]
        public async Task<IActionResult> Update(int id, BookUpdateDto dto)
        {
            var book = await _context.Books.FindAsync(id);
            if (book == null) return NotFound();

            if (await _context.Books.AnyAsync(b => b.ISBN == dto.ISBN && b.Id != id))
                return Conflict(new { message = "Another book already uses this ISBN." });

            var copiesOnLoan = book.TotalCopies - book.AvailableCopies;
            if (dto.TotalCopies < copiesOnLoan)
                return BadRequest(new { message = $"Cannot set total copies below the {copiesOnLoan} currently on loan." });

            book.Title = dto.Title;
            book.Author = dto.Author;
            book.ISBN = dto.ISBN;
            book.Publisher = dto.Publisher;
            book.PublishedYear = dto.PublishedYear;
            book.CategoryId = dto.CategoryId;
            book.AvailableCopies += dto.TotalCopies - book.TotalCopies;
            book.TotalCopies = dto.TotalCopies;
            book.CoverImageUrl = dto.CoverImageUrl;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var book = await _context.Books.FindAsync(id);
            if (book == null) return NotFound();

            var hasActiveLoans = await _context.Loans.AnyAsync(l => l.BookId == id && l.Status != LoanStatus.Returned);
            if (hasActiveLoans) return BadRequest(new { message = "Cannot delete a book with active loans." });

            _context.Books.Remove(book);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
