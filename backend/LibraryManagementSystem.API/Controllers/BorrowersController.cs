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
    public class BorrowersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public BorrowersController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<BorrowerReadDto>>> GetAll([FromQuery] string? search)
        {
            var query = _context.Borrowers.AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim().ToLower();
                query = query.Where(b => b.FullName.ToLower().Contains(term) || b.Email.ToLower().Contains(term));
            }

            var borrowers = await query
                .OrderBy(b => b.FullName)
                .Select(b => new BorrowerReadDto
                {
                    Id = b.Id,
                    FullName = b.FullName,
                    Email = b.Email,
                    Phone = b.Phone,
                    Address = b.Address,
                    MembershipDate = b.MembershipDate,
                    IsActive = b.IsActive,
                    ActiveLoanCount = b.Loans.Count(l => l.Status != LoanStatus.Returned)
                })
                .ToListAsync();

            return Ok(borrowers);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<BorrowerReadDto>> GetById(int id)
        {
            var b = await _context.Borrowers.Include(x => x.Loans).FirstOrDefaultAsync(x => x.Id == id);
            if (b == null) return NotFound();

            return Ok(new BorrowerReadDto
            {
                Id = b.Id,
                FullName = b.FullName,
                Email = b.Email,
                Phone = b.Phone,
                Address = b.Address,
                MembershipDate = b.MembershipDate,
                IsActive = b.IsActive,
                ActiveLoanCount = b.Loans.Count(l => l.Status != LoanStatus.Returned)
            });
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Librarian")]
        public async Task<ActionResult<Borrower>> Create(BorrowerCreateDto dto)
        {
            if (await _context.Borrowers.AnyAsync(b => b.Email == dto.Email))
                return Conflict(new { message = "A borrower with this email already exists." });

            var borrower = new Borrower
            {
                FullName = dto.FullName,
                Email = dto.Email,
                Phone = dto.Phone,
                Address = dto.Address
            };

            _context.Borrowers.Add(borrower);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = borrower.Id }, borrower);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Librarian")]
        public async Task<IActionResult> Update(int id, BorrowerUpdateDto dto)
        {
            var borrower = await _context.Borrowers.FindAsync(id);
            if (borrower == null) return NotFound();

            if (await _context.Borrowers.AnyAsync(b => b.Email == dto.Email && b.Id != id))
                return Conflict(new { message = "Another borrower already uses this email." });

            borrower.FullName = dto.FullName;
            borrower.Email = dto.Email;
            borrower.Phone = dto.Phone;
            borrower.Address = dto.Address;
            borrower.IsActive = dto.IsActive;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var borrower = await _context.Borrowers.FindAsync(id);
            if (borrower == null) return NotFound();

            var hasActiveLoans = await _context.Loans.AnyAsync(l => l.BorrowerId == id && l.Status != LoanStatus.Returned);
            if (hasActiveLoans) return BadRequest(new { message = "Cannot delete a borrower with active loans." });

            _context.Borrowers.Remove(borrower);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
