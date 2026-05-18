using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TransporteEscolar.API.Common;
using TransporteEscolar.Application.Responsaveis.Queries.BuscarPorCPF;

namespace TransporteEscolar.API.Controllers;

[Authorize]
[Route("api/[controller]")]
public class ResponsaveisController : BaseController
{
    private readonly IMediator _mediator;

    public ResponsaveisController(IMediator mediator) => _mediator = mediator;

    [HttpGet("por-cpf")]
    public async Task<IActionResult> BuscarPorCPF([FromQuery] string cpf, CancellationToken ct)
    {
        var result = await _mediator.Send(new BuscarResponsavelPorCPFQuery(cpf), ct);
        return result.IsSuccess ? OkResponse(result.Value) : NotFoundResponse(result.Error);
    }
}
