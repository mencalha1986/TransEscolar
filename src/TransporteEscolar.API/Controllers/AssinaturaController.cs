using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TransporteEscolar.API.Common;
using TransporteEscolar.Application.Backoffice.Assinaturas.Commands.GerarPixAssinatura;
using TransporteEscolar.Application.Backoffice.Assinaturas.Queries.ObterMinhaAssinatura;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.API.Controllers;

[Authorize]
[Route("api/assinatura")]
public class AssinaturaController : BaseController
{
    private readonly IMediator _mediator;
    private readonly ICurrentTenantService _tenant;
    private readonly IAssinaturaRepository _assinaturaRepo;

    public AssinaturaController(IMediator mediator, ICurrentTenantService tenant, IAssinaturaRepository assinaturaRepo)
        => (_mediator, _tenant, _assinaturaRepo) = (mediator, tenant, assinaturaRepo);

    [HttpGet("minha")]
    public async Task<IActionResult> ObterMinha(CancellationToken ct)
    {
        if (_tenant.TenantId is not Guid transportadorId)
            return ErrorResponse("Usuário sem transportador associado.");

        var result = await _mediator.Send(new ObterMinhaAssinaturaQuery(transportadorId), ct);
        if (!result.IsSuccess)
            return ErrorResponse(result.Error);

        return OkResponse(result.Value);
    }

    [HttpPost("minha/pix")]
    public async Task<IActionResult> GerarPix(CancellationToken ct)
    {
        if (_tenant.TenantId is not Guid transportadorId)
            return ErrorResponse("Usuário sem transportador associado.");

        var result = await _mediator.Send(new GerarPixAssinaturaCommand(transportadorId), ct);
        if (!result.IsSuccess)
            return ErrorResponse(result.Error);

        return OkResponse(result.Value);
    }

    [HttpGet("minha/pagamentos")]
    public async Task<IActionResult> ListarMeusPagamentos(CancellationToken ct)
    {
        if (_tenant.TenantId is not Guid transportadorId)
            return ErrorResponse("Usuário sem transportador associado.");

        var assinatura = await _assinaturaRepo.ObterPorTransportadorAsync(transportadorId, ct);
        if (assinatura is null)
            return ErrorResponse("Assinatura não encontrada.");

        var pagamentos = await _assinaturaRepo.ListarPagamentosAsync(assinatura.Id, ct);
        return OkResponse(pagamentos.Select(p => new
        {
            p.Id,
            p.ValorPago,
            p.CompetenciaMes,
            p.CompetenciaAno,
            DataPagamento = p.DataPagamento,
            p.Observacao
        }));
    }
}
