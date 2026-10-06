namespace SmartMed.Api.Models;

public class Branch
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid PharmacyId { get; set; }
    public Pharmacy? Pharmacy { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? PhoneNumber { get; set; }
    public bool IsActive { get; set; } = true;
}