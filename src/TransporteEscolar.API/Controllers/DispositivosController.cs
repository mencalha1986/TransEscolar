using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TransporteEscolar.API.Common;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.API.Controllers;

[Authorize]
[Route("api/[controller]")]
public class DispositivosController : BaseController
{
    private readonly IDispositivoTokenRepository _tokenRepo;
    private readonly ICurrentTenantService _tenant;

    public DispositivosController(IDispositivoTokenRepository tokenRepo, ICurrentTenantService tenant)
        => (_tokenRepo, _tenant) = (tokenRepo, tenant);

    [HttpPost("token")]
    public async Task<IActionResult> RegistrarToken([FromBody] RegistrarTokenRequest req, CancellationToken ct)
    {
        if (_tenant.UsuarioId is null)
            return ErrorResponse("Usuário não autenticado.");

        if (string.IsNullOrWhiteSpace(req.Token))
            return ErrorResponse("Token inválido.");

        var transportadorId = _tenant.TenantId ?? Guid.Empty;

        await _tokenRepo.SalvarOuAtualizarAsync(
            _tenant.UsuarioId.Value, transportadorId, req.Token, req.Plataforma, ct);

        return OkResponse(true);
    }
}

public record RegistrarTokenRequest(string Token, string Plataforma = "android");
