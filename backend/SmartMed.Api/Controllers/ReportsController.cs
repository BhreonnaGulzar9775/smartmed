using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartMed.Api.Data;

namespace SmartMed.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class ReportsController : ControllerBase
{
    private readonly SmartMedDbContext _db;
    public ReportsController(SmartMedDbContext db) => _db = db;

    [HttpGet("stock-summary")]
    public async Task<ActionResult> StockSummary()
    {
        var summary = await _db.Inventories
            .Include(i => i.Medicine)
            .GroupBy(i => i.Medicine!.Name)
            .Select(g => new
            {
                Medicine = g.Key,
                TotalQuantity = g.Sum(x => x.Quantity),
                Branches = g.Count()
            })
            .ToListAsync();
        return Ok(summary);
    }

    [HttpGet("dispensing-stats")]
    public async Task<ActionResult> DispensingStats()
    {
        var stats = await _db.Prescriptions
            .Where(p => p.Status == "Dispensed")
            .GroupBy(p => p.DispensedAt!.Value.Date)
            .Select(g => new { Date = g.Key, Count = g.Count() })
            .OrderByDescending(x => x.Date)
            .Take(30)
            .ToListAsync();
        return Ok(stats);
    }
}