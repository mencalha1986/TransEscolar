using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TransporteEscolar.API.Common;
using TransporteEscolar.Application.Escolas.Commands.AtualizarEscola;
using TransporteEscolar.Application.Escolas.Commands.CadastrarEscola;
using TransporteEscolar.Application.Escolas.Commands.DeletarEscola;
using TransporteEscolar.Application.Escolas.Queries.ListarEscolas;

namespace TransporteEscolar.API.Controllers;

[Authorize]
[Route("api/[controller]")]
public class EscolasController : BaseController
{
    private readonly IMediator _mediator;

    public EscolasController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> Listar(CancellationToken ct)
    {
        var result = await _mediator.Send(new ListarEscolasQuery(), ct);
        return OkResponse(result.Value);
    }

    [HttpPost]
    public async Task<IActionResult> Cadastrar([FromBody] CadastrarEscolaRequest req, CancellationToken ct)
    {
        var result = await _mediator.Send(new CadastrarEscolaCommand(
            req.Nome, req.Telefone,
            req.Logradouro, req.Numero, req.Bairro, req.Cidade, req.Estado, req.CEP), ct);

        if (!result.IsSuccess) return ErrorResponse(result.Error);
        return OkResponse(result.Value);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Atualizar(Guid id, [FromBody] AtualizarEscolaRequest req, CancellationToken ct)
    {
        var result = await _mediator.Send(new AtualizarEscolaCommand(
            id, req.Nome, req.Telefone,
            req.Logradouro, req.Numero, req.Bairro, req.Cidade, req.Estado, req.CEP), ct);

        if (!result.IsSuccess) return ErrorResponse(result.Error);
        return OkResponse(result.Value);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Deletar(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new DeletarEscolaCommand(id), ct);
        if (!result.IsSuccess) return ErrorResponse(result.Error);
        return OkResponse(result.Value);
    }
}

public record CadastrarEscolaRequest(
    string Nome,
    string Telefone,
    string Logradouro,
    string Numero,
    string Bairro,
    string Cidade,
    string Estado,
    string CEP);

public record AtualizarEscolaRequest(
    string Nome,
    string Telefone,
    string Logradouro,
    string Numero,
    string Bairro,
    string Cidade,
    string Estado,
    string CEP);
