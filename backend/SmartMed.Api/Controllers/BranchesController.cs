using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartMed.Api.Data;
using SmartMed.Api.Models;

namespace SmartMed.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BranchesController : ControllerBase
{
    private readonly SmartMedDbContext _db;
    public BranchesController(SmartMedDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult> GetAll()
    {
        var branches = await _db.Branches
            .Select(b => new { b.Id, b.Name, b.Address, b.PhoneNumber, b.IsActive })
            .ToListAsync();
        return Ok(branches);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult> Get(Guid id)
    {
        var b = await _db.Branches.FindAsync(id);
        if (b == null) return NotFound();
        return Ok(b);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> Create([FromBody] CreateBranchDto dto)
    {
        Guid pharmacyId = dto.PharmacyId;
        if (pharmacyId == Guid.Empty)
        {
            var pharmacy = await _db.Pharmacies.FirstOrDefaultAsync();
            if (pharmacy == null)
            {
                pharmacy = new Pharmacy { Name = "SmartMed Central", RegistrationNumber = "PHARM-001" };
                _db.Pharmacies.Add(pharmacy);
                await _db.SaveChangesAsync();
            }
            pharmacyId = pharmacy.Id;
        }

        var branch = new Branch
        {
            PharmacyId = pharmacyId,
            Name = dto.Name,
            Address = dto.Address,
            PhoneNumber = dto.PhoneNumber,
            IsActive = true
        };
        _db.Branches.Add(branch);
        await _db.SaveChangesAsync();
        return Ok(branch);
    }
}

public record CreateBranchDto(string Name, string? Address, string? PhoneNumber, Guid PharmacyId);