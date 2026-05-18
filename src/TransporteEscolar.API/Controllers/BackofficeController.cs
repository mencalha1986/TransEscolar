using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TransporteEscolar.API.Common;
using TransporteEscolar.Application.Backoffice.Assinaturas.Commands.CriarAssinatura;
using TransporteEscolar.Application.Backoffice.Assinaturas.Commands.RegistrarPagamentoAssinatura;
using TransporteEscolar.Application.Backoffice.Assinaturas.Queries.ListarAssinaturas;
using TransporteEscolar.Application.Backoffice.Dashboard.Queries.ObterDashboard;
using TransporteEscolar.Application.Backoffice.Planos.Commands.CriarPlano;
using TransporteEscolar.Application.Backoffice.Planos.Queries.ListarPlanos;
using TransporteEscolar.Application.Backoffice.Transportadores.Commands.AlterarStatusTransportador;
using TransporteEscolar.Application.Backoffice.Transportadores.Commands.CadastrarTransportador;
using TransporteEscolar.Application.Backoffice.Transportadores.Queries.ImpersonarTransportador;
using TransporteEscolar.Application.Backoffice.Transportadores.Queries.ListarTransportadores;
using TransporteEscolar.Application.Backoffice.Transportadores.Queries.ObterTransportador;
using TransporteEscolar.Domain.Entities;

namespace TransporteEscolar.API.Controllers;

[Authorize(Roles = "SuperAdmin")]
[Route("api/backoffice")]
public class BackofficeController : BaseController
{
    private readonly IMediator _mediator;

    public BackofficeController(IMediator mediator) => _mediator = mediator;

    // --- Dashboard ---

    [HttpGet("dashboard")]
    public async Task<IActionResult> Dashboard(CancellationToken ct)
    {
        var result = await _mediator.Send(new ObterDashboardQuery(), ct);
        return OkResponse(result);
    }

    // --- Transportadores ---

    [HttpGet("transportadores")]
    public async Task<IActionResult> ListarTransportadores(CancellationToken ct)
    {
        var result = await _mediator.Send(new ListarTransportadoresQuery(), ct);
        return OkResponse(result);
    }

    [HttpPost("transportadores")]
    public async Task<IActionResult> CadastrarTransportador([FromBody] CadastrarTransportadorRequest req, CancellationToken ct)
    {
        var result = await _mediator.Send(new CadastrarTransportadorCommand(
            req.NomeEmpresa, req.NomeContato, req.CpfCnpj, req.Email, req.Telefone, req.PlanoId), ct);

        if (!result.IsSuccess)
            return ErrorResponse(result.Error);

        return CreatedResponse(nameof(ObterTransportador), new { id = result.Value }, result.Value);
    }

    [HttpGet("transportadores/{id:guid}")]
    public async Task<IActionResult> ObterTransportador(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new ObterTransportadorQuery(id), ct);
        if (result is null) return NotFoundResponse("Transportador não encontrado.");
        return OkResponse(result);
    }

    [HttpPatch("transportadores/{id:guid}/status")]
    public async Task<IActionResult> AlterarStatus(Guid id, [FromBody] AlterarStatusRequest req, CancellationToken ct)
    {
        var result = await _mediator.Send(new AlterarStatusTransportadorCommand(id, req.Status), ct);
        if (!result.IsSuccess) return ErrorResponse(result.Error);
        return OkResponse(result.Value);
    }

    [HttpPost("transportadores/{id:guid}/impersonate")]
    public async Task<IActionResult> Impersonar(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new ImpersonarTransportadorQuery(id), ct);
        if (!result.IsSuccess) return ErrorResponse(result.Error);
        return OkResponse(new { token = result.Value });
    }

    // --- Planos ---

    [HttpGet("planos")]
    public async Task<IActionResult> ListarPlanos(CancellationToken ct)
    {
        var result = await _mediator.Send(new ListarPlanosQuery(), ct);
        return OkResponse(result);
    }

    [HttpPost("planos")]
    public async Task<IActionResult> CriarPlano([FromBody] CriarPlanoRequest req, CancellationToken ct)
    {
        var result = await _mediator.Send(new CriarPlanoCommand(req.Nome, req.PrecoMensal, req.LimiteAlunos, req.Descricao), ct);
        if (!result.IsSuccess) return ErrorResponse(result.Error);
        return OkResponse(result.Value);
    }

    // --- Assinaturas ---

    [HttpGet("assinaturas")]
    public async Task<IActionResult> ListarAssinaturas(CancellationToken ct)
    {
        var result = await _mediator.Send(new ListarAssinaturasQuery(), ct);
        return OkResponse(result);
    }

    [HttpPost("transportadores/{id:guid}/assinatura")]
    public async Task<IActionResult> CriarAssinatura(Guid id, [FromBody] CriarAssinaturaRequest req, CancellationToken ct)
    {
        var result = await _mediator.Send(new CriarAssinaturaCommand(id, req.PlanoId, req.ValorContratado), ct);
        if (!result.IsSuccess) return ErrorResponse(result.Error);
        return OkResponse(result.Value);
    }

    [HttpGet("assinaturas/{id:guid}/pagamentos")]
    public async Task<IActionResult> ListarPagamentos(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new ListarPagamentosAssinaturaQuery(id), ct);
        return OkResponse(result);
    }

    [HttpPost("assinaturas/{id:guid}/pagamentos")]
    public async Task<IActionResult> RegistrarPagamento(Guid id, [FromBody] RegistrarPagamentoRequest req, CancellationToken ct)
    {
        var result = await _mediator.Send(new RegistrarPagamentoAssinaturaCommand(
            id, req.ValorPago, req.CompetenciaMes, req.CompetenciaAno, req.Observacao), ct);
        if (!result.IsSuccess) return ErrorResponse(result.Error);
        return OkResponse(result.Value);
    }
}

public record CadastrarTransportadorRequest(string NomeEmpresa, string NomeContato, string CpfCnpj, string Email, string? Telefone, Guid? PlanoId);
public record AlterarStatusRequest(StatusTransportador Status);
public record CriarPlanoRequest(string Nome, decimal PrecoMensal, int? LimiteAlunos, string? Descricao);
public record CriarAssinaturaRequest(Guid PlanoId, decimal ValorContratado);
public record RegistrarPagamentoRequest(decimal ValorPago, int CompetenciaMes, int CompetenciaAno, string? Observacao);
