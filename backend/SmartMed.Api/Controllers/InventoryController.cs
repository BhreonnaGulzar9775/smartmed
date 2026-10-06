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
        var item = new Inventory
        {
            BranchId = dto.BranchId,
            MedicineId = dto.MedicineId,
            Quantity = dto.Quantity,
            ParLevel = dto.ParLevel,
            ExpiryDate = dto.ExpiryDate,
            BatchNumber = dto.BatchNumber
        };
        _db.Inventories.Add(item);
        await _db.SaveChangesAsync();
        return Ok(new { id = item.Id });
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