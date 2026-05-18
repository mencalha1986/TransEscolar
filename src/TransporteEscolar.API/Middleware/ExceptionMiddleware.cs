using FluentValidation;
using System.Text.Json;
using TransporteEscolar.API.Common;

namespace TransporteEscolar.API.Middleware;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
        => (_next, _logger) = (next, logger);

    public async Task InvokeAsync(HttpContext ctx)
    {
        try
        {
            await _next(ctx);
        }
        catch (ValidationException ex)
        {
            ctx.Response.StatusCode = 422;
            ctx.Response.ContentType = "application/json";
            var errors = ex.Errors.Select(e => e.ErrorMessage);
            var body = JsonSerializer.Serialize(new { success = false, errors });
            await ctx.Response.WriteAsync(body);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro inesperado");
            ctx.Response.StatusCode = 500;
            ctx.Response.ContentType = "application/json";
            var msg = "Erro interno do servidor.";
            var body = JsonSerializer.Serialize(ApiResponse<object>.Fail(msg));
            await ctx.Response.WriteAsync(body);
        }
    }
}
