using Microsoft.EntityFrameworkCore;
using SmartMed.Api.Models;

namespace SmartMed.Api.Data;

public class SmartMedDbContext : DbContext
{
    public SmartMedDbContext(DbContextOptions<SmartMedDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Pharmacy> Pharmacies => Set<Pharmacy>();
    public DbSet<Branch> Branches => Set<Branch>();
    public DbSet<Medicine> Medicines => Set<Medicine>();
    public DbSet<Inventory> Inventories => Set<Inventory>();
    public DbSet<Prescription> Prescriptions => Set<Prescription>();
    public DbSet<PrescriptionItem> PrescriptionItems => Set<PrescriptionItem>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<Notification> Notifications => Set<Notification>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(e =>
        {
            e.ToTable("Users");
            e.HasIndex(u => u.Email).IsUnique();
        });

        modelBuilder.Entity<Pharmacy>(e => e.ToTable("Pharmacies"));
        modelBuilder.Entity<Branch>(e => e.ToTable("Branches"));
        modelBuilder.Entity<Medicine>(e => e.ToTable("Medicines"));

        modelBuilder.Entity<Inventory>(e =>
        {
            e.ToTable("Inventory");
            e.HasIndex(i => new { i.BranchId, i.MedicineId, i.BatchNumber }).IsUnique();
        });

        modelBuilder.Entity<Prescription>(e =>
        {
            e.ToTable("Prescriptions");
            e.HasIndex(p => p.PrescriptionNumber).IsUnique();
        });

        modelBuilder.Entity<PrescriptionItem>(e => e.ToTable("PrescriptionItems"));
        modelBuilder.Entity<AuditLog>(e => e.ToTable("AuditLogs"));
        modelBuilder.Entity<Notification>(e => e.ToTable("Notifications"));
    }
}