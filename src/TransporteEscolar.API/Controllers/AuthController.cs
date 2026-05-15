using MediatR;
using Microsoft.AspNetCore.Mvc;
using TransporteEscolar.API.Common;
using TransporteEscolar.Application.Auth.Commands.LoginUsuario;
using TransporteEscolar.Application.Auth.Commands.RegistrarUsuario;
using TransporteEscolar.Domain.Entities;

namespace TransporteEscolar.API.Controllers;

[Route("api/auth")]
public class AuthController : BaseController
{
    private readonly IMediator _mediator;

    public AuthController(IMediator mediator) => _mediator = mediator;

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest req, CancellationToken ct)
    {
        var cmd = new RegistrarUsuarioCommand(req.Nome, req.Email, req.Senha, req.Perfil);
        var result = await _mediator.Send(cmd, ct);

        if (!result.IsSuccess)
            return ErrorResponse(result.Error);

        return CreatedResponse(nameof(Register), new { }, result.Value);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req, CancellationToken ct)
    {
        var cmd = new LoginUsuarioCommand(req.Email, req.Senha);
        var result = await _mediator.Send(cmd, ct);

        if (!result.IsSuccess)
            return Unauthorized(ApiResponse<object>.Fail(result.Error));

        return OkResponse(new { token = result.Value });
    }
}

public record RegisterRequest(string Nome, string Email, string Senha, PerfilUsuario Perfil);
public record LoginRequest(string Email, string Senha);
