using System.ComponentModel.DataAnnotations;

namespace LibraryManagementSystem.API.DTOs
{
    public class BookCreateDto
    {
        [Required, MaxLength(255)]
        public string Title { get; set; } = string.Empty;

        [Required, MaxLength(150)]
        public string Author { get; set; } = string.Empty;

        [Required, MaxLength(20)]
        public string ISBN { get; set; } = string.Empty;

        public string? Publisher { get; set; }

        public int? PublishedYear { get; set; }

        [Required]
        public int CategoryId { get; set; }

        [Range(0, int.MaxValue)]
        public int TotalCopies { get; set; }

        public string? CoverImageUrl { get; set; }
    }

    public class BookUpdateDto : BookCreateDto
    {
    }

    public class BookReadDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public string ISBN { get; set; } = string.Empty;
        public string? Publisher { get; set; }
        public int? PublishedYear { get; set; }
        public int CategoryId { get; set; }
        public string? CategoryName { get; set; }
        public int TotalCopies { get; set; }
        public int AvailableCopies { get; set; }
        public string? CoverImageUrl { get; set; }
    }
}
