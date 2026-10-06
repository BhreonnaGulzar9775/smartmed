namespace SmartMed.Api.Models;

public class Medicine
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string? GenericName { get; set; }
    public string? Description { get; set; }
    public bool RequiresPrescription { get; set; } = true;
    public bool IsColdChain { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}