using MediatR;
using Microsoft.AspNetCore.Mvc;
using TransporteEscolar.API.Common;
using TransporteEscolar.Application.Alunos.Commands.CadastrarAluno;
using TransporteEscolar.Application.Alunos.Queries.ListarAlunos;

namespace TransporteEscolar.API.Controllers;

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

        var cmd = new CadastrarAlunoCommand(req.Nome, req.DataNascimento, req.EscolaId, foto);
        var result = await _mediator.Send(cmd, ct);

        if (!result.IsSuccess)
            return ErrorResponse(result.Error);

        return CreatedResponse(nameof(ObterPorId), new { id = result.Value }, result.Value);
    }

    [HttpGet("{id:guid}")]
    public IActionResult ObterPorId(Guid id) => NotFoundResponse("Não implementado.");
}

public record CadastrarAlunoRequest(string Nome, DateTime DataNascimento, Guid EscolaId, IFormFile? Foto);
