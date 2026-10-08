using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartMed.Api.Data;
using SmartMed.Api.Models;

namespace SmartMed.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MedicinesController : ControllerBase
{
    private readonly SmartMedDbContext _db;
    public MedicinesController(SmartMedDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult> GetAll()
    {
        var meds = await _db.Medicines
            .Select(m => new { m.Id, m.Name, m.GenericName, m.Description, m.RequiresPrescription, m.IsColdChain })
            .ToListAsync();
        return Ok(meds);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> Create([FromBody] CreateMedicineDto dto)
    {
        var med = new Medicine
        {
            Name = dto.Name,
            GenericName = dto.GenericName,
            Description = dto.Description,
            RequiresPrescription = dto.RequiresPrescription,
            IsColdChain = dto.IsColdChain
        };
        _db.Medicines.Add(med);
        await _db.SaveChangesAsync();
        return Ok(med);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var med = await _db.Medicines.FindAsync(id);
        if (med == null) return NotFound();
        _db.Medicines.Remove(med);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}

public record CreateMedicineDto(string Name, string? GenericName, string? Description, bool RequiresPrescription, bool IsColdChain);