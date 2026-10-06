using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartMed.Api.Data;

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
}