namespace SmartMed.Api.Models;

public class Notification
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public User? User { get; set; }
    public string Type { get; set; } = "Email";
    public string? Subject { get; set; }
    public string? Message { get; set; }
    public string Status { get; set; } = "Pending";
    public DateTime? SentAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}