namespace SmartMed.Api.Models;

public class Inventory
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid BranchId { get; set; }
    public Branch? Branch { get; set; }
    public Guid MedicineId { get; set; }
    public Medicine? Medicine { get; set; }
    public int Quantity { get; set; }
    public int ParLevel { get; set; } = 20;
    public DateTime? ExpiryDate { get; set; }
    public string? BatchNumber { get; set; }
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
}