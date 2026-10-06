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

    [HttpPost]
    [Authorize(Roles = "Admin,Pharmacist")]
    public async Task<ActionResult> Create(CreatePrescriptionDto dto)
    {
        var prescription = new Prescription
        {
            PatientId = dto.PatientId,
            PharmacistId = GetUserId(),
            BranchId = dto.BranchId,
            PrescriptionNumber = $"RX-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..6].ToUpper()}",
            Notes = dto.Notes,
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

            if (inv == null || inv.Quantity < item.Quantity)
                return BadRequest(new { message = $"Insufficient stock for medicine {item.MedicineId}" });

            inv.Quantity -= item.Quantity;
            inv.LastUpdated = DateTime.UtcNow;
        }

        p.Status = "Dispensed";
        p.DispensedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private Guid GetUserId() =>
        Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);

    private static PrescriptionResponseDto MapToDto(Prescription p) => new(
        p.Id,
        p.PrescriptionNumber,
        p.Status,
        p.CreatedAt,
        p.PatientId,
        p.Patient?.FullName ?? "",
        p.BranchId,
        p.Branch?.Name ?? "",
        p.Items.Select(i => new PrescriptionItemResponseDto(
            i.MedicineId, i.Medicine?.Name ?? "", i.Dosage, i.Quantity, i.Instructions)).ToList());
}