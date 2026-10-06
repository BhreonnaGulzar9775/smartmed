namespace SmartMed.Api.Models;

public class Prescription
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid PatientId { get; set; }
    public User? Patient { get; set; }
    public Guid PharmacistId { get; set; }
    public User? Pharmacist { get; set; }
    public Guid BranchId { get; set; }
    public Branch? Branch { get; set; }
    public string PrescriptionNumber { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending";
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? DispensedAt { get; set; }
    public ICollection<PrescriptionItem> Items { get; set; } = new List<PrescriptionItem>();
}