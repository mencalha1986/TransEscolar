using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TransporteEscolar.API.Common;
using TransporteEscolar.Application.Alunos.Commands.CadastrarAluno;
using TransporteEscolar.Application.Alunos.Commands.EditarAluno;
using TransporteEscolar.Application.Alunos.Queries.ListarAlunos;
using TransporteEscolar.Application.Alunos.Queries.ObterAluno;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Entities;

namespace TransporteEscolar.API.Controllers;

[Authorize]
[Route("api/[controller]")]
public class AlunosController : BaseController
{
    private readonly IMediator _mediator;

    public AlunosController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> Listar([FromQuery] Guid? escolaId, CancellationToken ct)
    {
        var result = await _mediator.Send(new ListarAlunosQuery(escolaId), ct);
        return OkResponse(result.Value);
    }

    [HttpPost]
    public async Task<IActionResult> Cadastrar([FromForm] CadastrarAlunoRequest req, CancellationToken ct)
    {
        byte[]? foto = null;
        if (req.Foto is { Length: > 0 })
        {
            using var ms = new MemoryStream();
            await req.Foto.CopyToAsync(ms, ct);
            foto = ms.ToArray();
        }

        var cmd = new CadastrarAlunoCommand(req.Nome, req.DataNascimento, req.EscolaId, req.ValorMensalidade, req.DiaVencimento, req.Turno, req.EmailResponsavel, req.NomeResponsavel, req.TelefoneResponsavel, req.CpfResponsavel, foto);
        var result = await _mediator.Send(cmd, ct);

        if (!result.IsSuccess)
            return ErrorResponse(result.Error);

        return CreatedResponse(nameof(ObterPorId), new { id = result.Value }, result.Value);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> ObterPorId(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new ObterAlunoQuery(id), ct);
        return result.IsSuccess ? OkResponse(result.Value) : NotFoundResponse(result.Error);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Editar(Guid id, [FromForm] EditarAlunoRequest req, CancellationToken ct)
    {
        byte[]? foto = null;
        if (req.Foto is { Length: > 0 })
        {
            using var ms = new MemoryStream();
            await req.Foto.CopyToAsync(ms, ct);
            foto = ms.ToArray();
        }

        List<EditarResponsavelDto>? responsaveis = null;
        if (!string.IsNullOrWhiteSpace(req.ResponsaveisJson))
        {
            responsaveis = System.Text.Json.JsonSerializer.Deserialize<List<EditarResponsavelDto>>(
                req.ResponsaveisJson,
                new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        }

        NovoResponsavelDto? novoResponsavel = null;
        if (!string.IsNullOrWhiteSpace(req.NovoResponsavelJson))
        {
            novoResponsavel = System.Text.Json.JsonSerializer.Deserialize<NovoResponsavelDto>(
                req.NovoResponsavelJson,
                new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        }

        var cmd = new EditarAlunoCommand(id, req.Nome, req.DataNascimento, req.EscolaId,
            req.ValorMensalidade, req.DiaVencimento, req.Turno, responsaveis, novoResponsavel, foto);
        var result = await _mediator.Send(cmd, ct);

        return result.IsSuccess ? OkResponse(result.Value) : NotFoundResponse(result.Error);
    }
}

public record CadastrarAlunoRequest(string Nome, DateTime DataNascimento, Guid EscolaId, decimal ValorMensalidade, int DiaVencimento, TurnoAluno Turno, string EmailResponsavel, string NomeResponsavel, string TelefoneResponsavel, string CpfResponsavel, IFormFile? Foto);

public record EditarAlunoRequest(string Nome, DateTime DataNascimento, Guid EscolaId, decimal ValorMensalidade, int DiaVencimento, TurnoAluno Turno, string? ResponsaveisJson, string? NovoResponsavelJson, IFormFile? Foto);
