using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TransporteEscolar.API.Common;
using TransporteEscolar.Application.Rotas.Commands.CriarRota;
using TransporteEscolar.Application.Rotas.Commands.DeletarRota;
using TransporteEscolar.Application.Rotas.Commands.EditarRota;
using TransporteEscolar.Application.Rotas.Commands.GerenciarAlunosRota;
using TransporteEscolar.Application.Rotas.Queries.ListarRotas;
using TransporteEscolar.Domain.Entities;

namespace TransporteEscolar.API.Controllers;

[Authorize(Roles = "Admin")]
[Route("api/[controller]")]
public class RotasController : BaseController
{
    private readonly IMediator _mediator;

    public RotasController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> Listar(CancellationToken ct)
    {
        var result = await _mediator.Send(new ListarRotasQuery(), ct);
        return OkResponse(result);
    }

    [HttpPost]
    public async Task<IActionResult> Criar([FromBody] CriarRotaRequest req, CancellationToken ct)
    {
        var result = await _mediator.Send(new CriarRotaCommand(req.Nome, req.Turno, req.MotoristaId, req.TransporteId), ct);
        if (!result.IsSuccess) return ErrorResponse(result.Error);
        return OkResponse(result.Value);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Editar(Guid id, [FromBody] EditarRotaRequest req, CancellationToken ct)
    {
        var result = await _mediator.Send(new EditarRotaCommand(id, req.Nome, req.Turno, req.MotoristaId, req.TransporteId), ct);
        if (!result.IsSuccess) return ErrorResponse(result.Error);
        return OkResponse(result.Value);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Deletar(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new DeletarRotaCommand(id), ct);
        if (!result.IsSuccess) return ErrorResponse(result.Error);
        return OkResponse(result.Value);
    }

    [HttpPost("{id:guid}/alunos/{alunoId:guid}")]
    public async Task<IActionResult> AdicionarAluno(Guid id, Guid alunoId, CancellationToken ct)
    {
        var result = await _mediator.Send(new AdicionarAlunoRotaCommand(id, alunoId), ct);
        if (!result.IsSuccess) return ErrorResponse(result.Error);
        return OkResponse(result.Value);
    }

    [HttpDelete("{id:guid}/alunos/{alunoId:guid}")]
    public async Task<IActionResult> RemoverAluno(Guid id, Guid alunoId, CancellationToken ct)
    {
        var result = await _mediator.Send(new RemoverAlunoRotaCommand(id, alunoId), ct);
        if (!result.IsSuccess) return ErrorResponse(result.Error);
        return OkResponse(result.Value);
    }
}

public record CriarRotaRequest(string Nome, TurnoAluno Turno, Guid? MotoristaId, Guid? TransporteId);
public record EditarRotaRequest(string Nome, TurnoAluno Turno, Guid? MotoristaId, Guid? TransporteId);
