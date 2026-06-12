using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TransporteEscolar.API.Common;
using TransporteEscolar.Application.Motoristas.Commands.CriarAcessoMotorista;
using TransporteEscolar.Application.Motoristas.Commands.CriarMotorista;
using TransporteEscolar.Application.Motoristas.Commands.DeletarMotorista;
using TransporteEscolar.Application.Motoristas.Commands.EditarMotorista;
using TransporteEscolar.Application.Motoristas.Queries.ListarMotoristas;

namespace TransporteEscolar.API.Controllers;

[Authorize(Roles = "Admin")]
[Route("api/[controller]")]
public class MotoristasController : BaseController
{
    private readonly IMediator _mediator;

    public MotoristasController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> Listar(CancellationToken ct)
    {
        var result = await _mediator.Send(new ListarMotoristasQuery(), ct);
        return OkResponse(result);
    }

    [HttpPost]
    public async Task<IActionResult> Criar([FromBody] CriarMotoristaRequest req, CancellationToken ct)
    {
        var result = await _mediator.Send(new CriarMotoristaCommand(req.Nome, req.Cpf, req.Cnh, req.Telefone), ct);
        if (!result.IsSuccess) return ErrorResponse(result.Error);
        return OkResponse(result.Value);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Editar(Guid id, [FromBody] EditarMotoristaRequest req, CancellationToken ct)
    {
        var result = await _mediator.Send(new EditarMotoristaCommand(id, req.Nome, req.Cnh, req.Telefone), ct);
        if (!result.IsSuccess) return ErrorResponse(result.Error);
        return OkResponse(result.Value);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Deletar(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new DeletarMotoristaCommand(id), ct);
        if (!result.IsSuccess) return ErrorResponse(result.Error);
        return OkResponse(result.Value);
    }

    [HttpPost("{id:guid}/criar-acesso")]
    public async Task<IActionResult> CriarAcesso(Guid id, [FromBody] CriarAcessoMotoristaRequest req, CancellationToken ct)
    {
        var result = await _mediator.Send(new CriarAcessoMotoristaCommand(id, req.Email), ct);
        if (!result.IsSuccess) return ErrorResponse(result.Error);
        return OkResponse(result.Value);
    }
}

public record CriarMotoristaRequest(string Nome, string Cpf, string? Cnh, string? Telefone);
public record EditarMotoristaRequest(string Nome, string? Cnh, string? Telefone);
public record CriarAcessoMotoristaRequest(string Email);
