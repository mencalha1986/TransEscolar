using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using TransporteEscolar.Domain.Entities;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Infrastructure.Services;

public class CurrentTenantService : ICurrentTenantService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentTenantService(IHttpContextAccessor httpContextAccessor)
        => _httpContextAccessor = httpContextAccessor;

    public Guid? TenantId
    {
        get
        {
            var claim = _httpContextAccessor.HttpContext?.User.FindFirst("tenant_id");
            return claim is not null && Guid.TryParse(claim.Value, out var id) ? id : null;
        }
    }

    public bool IsSuperAdmin
    {
        get
        {
            var role = _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.Role)?.Value;
            return role == PerfilUsuario.SuperAdmin.ToString();
        }
    }

    public Guid? UsuarioId
    {
        get
        {
            var claim = _httpContextAccessor.HttpContext?.User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)
                     ?? _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier);
            return claim is not null && Guid.TryParse(claim.Value, out var id) ? id : null;
        }
    }

    public string? UsuarioNome =>
        _httpContextAccessor.HttpContext?.User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Name)?.Value
        ?? _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.Name)?.Value;

    public string? UsuarioEmail =>
        _httpContextAccessor.HttpContext?.User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Email)?.Value
        ?? _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.Email)?.Value;

    public string? UsuarioPerfil =>
        _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.Role)?.Value;
}
