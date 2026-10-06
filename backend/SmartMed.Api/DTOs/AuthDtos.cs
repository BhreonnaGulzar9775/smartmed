namespace SmartMed.Api.DTOs;

public record RegisterDto(string Email, string Password, string FullName, string Role, string? PhoneNumber);
public record LoginDto(string Email, string Password);
public record AuthResponseDto(string Token, string Email, string FullName, string Role);