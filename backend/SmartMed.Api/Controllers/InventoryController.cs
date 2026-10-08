using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartMed.Api.Data;
using SmartMed.Api.DTOs;
using SmartMed.Api.Models;

namespace SmartMed.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class InventoryController : ControllerBase
{
    private readonly SmartMedDbContext _db;

    public InventoryController(SmartMedDbContext db) => _db = db;

    [HttpGet("branch/{branchId}")]
    public async Task<ActionResult<IEnumerable<InventoryResponseDto>>> GetByBranch(Guid branchId)
    {
        var items = await _db.Inventories
            .Include(i => i.Branch)
            .Include(i => i.Medicine)
            .Where(i => i.BranchId == branchId)
            .Select(i => new InventoryResponseDto(
                i.Id, i.BranchId, i.Branch!.Name,
                i.MedicineId, i.Medicine!.Name,
                i.Quantity, i.ParLevel, i.ExpiryDate, i.BatchNumber))
            .ToListAsync();

        return Ok(items);
    }

    [HttpGet("medicine/{medicineId}")]
    public async Task<ActionResult<IEnumerable<InventoryResponseDto>>> GetByMedicine(Guid medicineId)
    {
        var items = await _db.Inventories
            .Include(i => i.Branch)
            .Include(i => i.Medicine)
            .Where(i => i.MedicineId == medicineId)
            .Select(i => new InventoryResponseDto(
                i.Id, i.BranchId, i.Branch!.Name,
                i.MedicineId, i.Medicine!.Name,
                i.Quantity, i.ParLevel, i.ExpiryDate, i.BatchNumber))
            .ToListAsync();

        return Ok(items);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Pharmacist")]
    public async Task<ActionResult> Create(CreateInventoryDto dto)
    {
        var existing = await _db.Inventories
            .FirstOrDefaultAsync(i => i.BranchId == dto.BranchId
                                   && i.MedicineId == dto.MedicineId
                                   && i.BatchNumber == dto.BatchNumber);

        if (existing != null)
        {
            existing.Quantity += dto.Quantity;
            existing.LastUpdated = DateTime.UtcNow;
            if (dto.ExpiryDate.HasValue) existing.ExpiryDate = dto.ExpiryDate;
            await _db.SaveChangesAsync();
            return Ok(new { id = existing.Id, updated = true });
        }

        var item = new Inventory
        {
            BranchId = dto.BranchId,
            MedicineId = dto.MedicineId,
            Quantity = dto.Quantity,
            ParLevel = dto.ParLevel,
            ExpiryDate = dto.ExpiryDate,
            BatchNumber = dto.BatchNumber ?? "DEFAULT"
        };

        _db.Inventories.Add(item);
        await _db.SaveChangesAsync();

        return Ok(new { id = item.Id, created = true });
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Pharmacist")]
    public async Task<IActionResult> Update(Guid id, UpdateInventoryDto dto)
    {
        var item = await _db.Inventories.FindAsync(id);
        if (item == null) return NotFound();

        item.Quantity = dto.Quantity;
        item.LastUpdated = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var item = await _db.Inventories.FindAsync(id);
        if (item == null) return NotFound();
        _db.Inventories.Remove(item);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("low-stock")]
    [Authorize(Roles = "Admin,Pharmacist")]
    public async Task<ActionResult<IEnumerable<InventoryResponseDto>>> GetLowStock()
    {
        var items = await _db.Inventories
            .Include(i => i.Branch)
            .Include(i => i.Medicine)
            .Where(i => i.Quantity <= i.ParLevel)
            .Select(i => new InventoryResponseDto(
                i.Id, i.BranchId, i.Branch!.Name,
                i.MedicineId, i.Medicine!.Name,
                i.Quantity, i.ParLevel, i.ExpiryDate, i.BatchNumber))
            .ToListAsync();

        return Ok(items);
    }

    [HttpGet("expiring")]
    [Authorize(Roles = "Admin,Pharmacist")]
    public async Task<ActionResult<IEnumerable<InventoryResponseDto>>> GetExpiring()
    {
        var cutoff = DateTime.UtcNow.AddDays(30);
        var items = await _db.Inventories
            .Include(i => i.Branch)
            .Include(i => i.Medicine)
            .Where(i => i.ExpiryDate != null && i.ExpiryDate <= cutoff)
            .Select(i => new InventoryResponseDto(
                i.Id, i.BranchId, i.Branch!.Name,
                i.MedicineId, i.Medicine!.Name,
                i.Quantity, i.ParLevel, i.ExpiryDate, i.BatchNumber))
            .ToListAsync();

        return Ok(items);
    }
}