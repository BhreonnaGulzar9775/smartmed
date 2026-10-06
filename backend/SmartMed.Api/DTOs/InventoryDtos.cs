namespace SmartMed.Api.DTOs;

public record CreateInventoryDto(Guid BranchId, Guid MedicineId, int Quantity, int ParLevel, DateTime? ExpiryDate, string? BatchNumber);
public record UpdateInventoryDto(int Quantity);
public record InventoryResponseDto(
    Guid Id,
    Guid BranchId,
    string BranchName,
    Guid MedicineId,
    string MedicineName,
    int Quantity,
    int ParLevel,
    DateTime? ExpiryDate,
    string? BatchNumber);