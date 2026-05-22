using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.API.Controllers;

[ApiController]
[Route("api/contato")]
[AllowAnonymous]
public class ContatoController : ControllerBase
{
    private readonly IEmailService _emailService;

    public ContatoController(IEmailService emailService) => _emailService = emailService;

    [HttpPost]
    public async Task<IActionResult> Enviar([FromBody] ContatoRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Nome) ||
            string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Mensagem))
        {
            return BadRequest(new { success = false, error = "Nome, e-mail e mensagem são obrigatórios." });
        }

        try
        {
            await _emailService.EnviarContatoAsync(request.Nome, request.Email, request.Telefone ?? "", request.Mensagem, ct);
            return Ok(new { success = true });
        }
        catch
        {
            return StatusCode(500, new { success = false, error = "Erro ao enviar e-mail. Tente novamente mais tarde." });
        }
    }
}

public record ContatoRequest(string Nome, string Email, string? Telefone, string Mensagem);
