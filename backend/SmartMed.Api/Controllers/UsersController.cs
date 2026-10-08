using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartMed.Api.Data;

namespace SmartMed.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,Pharmacist")]
public class UsersController : ControllerBase
{
    private readonly SmartMedDbContext _db;
    public UsersController(SmartMedDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult> GetAll([FromQuery] string? role)
    {
        var query = _db.Users.AsQueryable();
        if (!string.IsNullOrEmpty(role))
            query = query.Where(u => u.Role == role);

        var users = await query
            .Select(u => new { u.Id, u.Email, u.FullName, u.Role, u.PhoneNumber })
            .ToListAsync();

        return Ok(users);
    }
}