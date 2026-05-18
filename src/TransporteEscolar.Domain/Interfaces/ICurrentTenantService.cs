namespace TransporteEscolar.Domain.Interfaces;

public interface ICurrentTenantService
{
    Guid? TenantId { get; }
    bool IsSuperAdmin { get; }
    Guid? UsuarioId { get; }
    string? UsuarioNome { get; }
    string? UsuarioPerfil { get; }
}
