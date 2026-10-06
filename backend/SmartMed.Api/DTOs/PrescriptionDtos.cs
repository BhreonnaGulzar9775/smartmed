namespace SmartMed.Api.DTOs;

public record PrescriptionItemDto(Guid MedicineId, string? Dosage, int Quantity, string? Instructions);

public record CreatePrescriptionDto(Guid PatientId, Guid BranchId, string? Notes, List<PrescriptionItemDto> Items);

public record PrescriptionItemResponseDto(Guid MedicineId, string MedicineName, string? Dosage, int Quantity, string? Instructions);

public record PrescriptionResponseDto(
	Guid Id,
	string PrescriptionNumber,
	string Status,
	DateTime CreatedAt,
	Guid PatientId,
	string PatientName,
	Guid BranchId,
	string BranchName,
	List<PrescriptionItemResponseDto> Items);