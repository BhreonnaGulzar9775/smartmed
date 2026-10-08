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
public class PrescriptionsController : ControllerBase
{
    private readonly SmartMedDbContext _db;

    public PrescriptionsController(SmartMedDbContext db) => _db = db;

    [HttpGet]
    [Authorize(Roles = "Admin,Pharmacist")]
    public async Task<ActionResult<IEnumerable<PrescriptionResponseDto>>> GetAll()
    {
        var list = await _db.Prescriptions
            .Include(x => x.Patient)
            .Include(x => x.Branch)
            .Include(x => x.Items).ThenInclude(i => i.Medicine)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();

        return Ok(list.Select(MapToDto));
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Pharmacist")]
    public async Task<ActionResult> Create([FromBody] CreatePrescriptionDto dto)
    {
        if (dto.Items == null || dto.Items.Count == 0)
            return BadRequest(new { message = "At least one item is required" });

        var prescription = new Prescription
        {
            PatientId = dto.PatientId,
            PharmacistId = GetUserId(),
            BranchId = dto.BranchId,
            PrescriptionNumber = $"RX-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..6].ToUpper()}",
            Notes = dto.Notes,
            Status = "Pending",
            Items = dto.Items.Select(i => new PrescriptionItem
            {
                MedicineId = i.MedicineId,
                Dosage = i.Dosage,
                Quantity = i.Quantity,
                Instructions = i.Instructions
            }).ToList()
        };

        _db.Prescriptions.Add(prescription);
        await _db.SaveChangesAsync();
        return Ok(new { id = prescription.Id, number = prescription.PrescriptionNumber });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PrescriptionResponseDto>> Get(Guid id)
    {
        var p = await _db.Prescriptions
            .Include(x => x.Patient)
            .Include(x => x.Branch)
            .Include(x => x.Items).ThenInclude(i => i.Medicine)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (p == null) return NotFound();
        return Ok(MapToDto(p));
    }

    [HttpGet("patient/{patientId}")]
    public async Task<ActionResult<IEnumerable<PrescriptionResponseDto>>> GetByPatient(Guid patientId)
    {
        var list = await _db.Prescriptions
            .Include(x => x.Patient)
            .Include(x => x.Branch)
            .Include(x => x.Items).ThenInclude(i => i.Medicine)
            .Where(x => x.PatientId == patientId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();

        return Ok(list.Select(MapToDto));
    }

    [HttpGet("me")]
    public async Task<ActionResult<IEnumerable<PrescriptionResponseDto>>> GetMine()
    {
        var userId = GetUserId();
        var list = await _db.Prescriptions
            .Include(x => x.Patient)
            .Include(x => x.Branch)
            .Include(x => x.Items).ThenInclude(i => i.Medicine)
            .Where(x => x.PatientId == userId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();

        return Ok(list.Select(MapToDto));
    }

    [HttpPost("{id}/dispense")]
    [Authorize(Roles = "Admin,Pharmacist")]
    public async Task<IActionResult> Dispense(Guid id)
    {
        var p = await _db.Prescriptions
            .Include(x => x.Items)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (p == null) return NotFound();
        if (p.Status == "Dispensed") return BadRequest(new { message = "Already dispensed" });

        foreach (var item in p.Items)
        {
            var inv = await _db.Inventories
                .Where(i => i.BranchId == p.BranchId && i.MedicineId == item.MedicineId)
                .OrderBy(i => i.ExpiryDate)
                .FirstOrDefaultAsync();

            if (inv == null)
                return BadRequest(new { message = $"No stock record for medicine at this branch" });

            if (inv.Quantity < item.Quantity)
                return BadRequest(new { message = $"Insufficient stock: need {item.Quantity}, have {inv.Quantity}" });

            inv.Quantity -= item.Quantity;
            inv.LastUpdated = DateTime.UtcNow;
        }

        p.Status = "Dispensed";
        p.DispensedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var p = await _db.Prescriptions.Include(x => x.Items).FirstOrDefaultAsync(x => x.Id == id);
        if (p == null) return NotFound();
        _db.Prescriptions.Remove(p);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private Guid GetUserId() =>
        Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);

    private static PrescriptionResponseDto MapToDto(Prescription p) => new(
        p.Id, p.PrescriptionNumber, p.Status, p.CreatedAt,
        p.PatientId, p.Patient?.FullName ?? "",
        p.BranchId, p.Branch?.Name ?? "",
        p.Items.Select(i => new PrescriptionItemResponseDto(
            i.MedicineId, i.Medicine?.Name ?? "", i.Dosage, i.Quantity, i.Instructions)).ToList()
    );
}