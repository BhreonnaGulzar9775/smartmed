using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartMed.Api.Data;

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
            .Select(m => new { m.Id, m.Name, m.GenericName, m.RequiresPrescription, m.IsColdChain })
            .ToListAsync();
        return Ok(meds);
    }
}