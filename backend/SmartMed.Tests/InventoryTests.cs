using Microsoft.EntityFrameworkCore;
using SmartMed.Api.Data;
using SmartMed.Api.Models;
using Xunit;

namespace SmartMed.Tests;

public class InventoryTests
{
    private SmartMedDbContext GetDb()
    {
        var opts = new DbContextOptionsBuilder<SmartMedDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new SmartMedDbContext(opts);
    }

    [Fact]
    public async Task Can_Add_Inventory()
    {
        var db = GetDb();
        var branch = new Branch { Name = "Test Branch" };
        var medicine = new Medicine { Name = "Panado" };
        db.Branches.Add(branch);
        db.Medicines.Add(medicine);
        await db.SaveChangesAsync();

        db.Inventories.Add(new Inventory
        {
            BranchId = branch.Id,
            MedicineId = medicine.Id,
            Quantity = 50,
            ParLevel = 10
        });
        await db.SaveChangesAsync();

        Assert.Equal(1, await db.Inventories.CountAsync());
    }

    [Fact]
    public async Task Low_Stock_Query_Works()
    {
        var db = GetDb();
        var branch = new Branch { Name = "B" };
        var med = new Medicine { Name = "M" };
        db.Branches.Add(branch);
        db.Medicines.Add(med);
        await db.SaveChangesAsync();

        db.Inventories.Add(new Inventory { BranchId = branch.Id, MedicineId = med.Id, Quantity = 5, ParLevel = 20 });
        db.Inventories.Add(new Inventory { BranchId = branch.Id, MedicineId = med.Id, Quantity = 100, ParLevel = 20, BatchNumber = "B2" });
        await db.SaveChangesAsync();

        var low = await db.Inventories.Where(i => i.Quantity <= i.ParLevel).ToListAsync();
        Assert.Single(low);
    }
}