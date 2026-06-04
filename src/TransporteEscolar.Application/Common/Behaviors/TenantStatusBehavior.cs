using MediatR;
using TransporteEscolar.Domain.Entities;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Common.Behaviors;

/// <summary>
/// Bloqueia comandos operacionais quando a assinatura do tenant está inadimplente.
/// Só se aplica a comandos (nome termina em "Command") fora dos namespaces de auth/assinatura/dispositivo.
/// </summary>
public class TenantStatusBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    private readonly ICurrentTenantService _tenant;
    private readonly IAssinaturaRepository _assinaturaRepo;

    public TenantStatusBehavior(ICurrentTenantService tenant, IAssinaturaRepository assinaturaRepo)
        => (_tenant, _assinaturaRepo) = (tenant, assinaturaRepo);

    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken ct)
    {
        if (!DeveVerificar(request))
            return await next();

        var tenantId = _tenant.TenantId!.Value;
        var assinatura = await _assinaturaRepo.ObterPorTransportadorAsync(tenantId, ct);

        if (assinatura?.Status == StatusAssinatura.Inadimplente)
            throw new AssinaturaInadimplenteException();

        return await next();
    }

    private bool DeveVerificar(TRequest request)
    {
        // Só verifica tenants identificados (não SuperAdmin)
        if (_tenant.TenantId is null || _tenant.IsSuperAdmin)
            return false;

        // Só bloqueia Commands, não Queries
        var typeName = typeof(TRequest).Name;
        if (!typeName.EndsWith("Command"))
            return false;

        // Exclui namespaces que não devem ser bloqueados
        var ns = typeof(TRequest).Namespace ?? string.Empty;
        if (ns.Contains("Auth") || ns.Contains("Assinatura") || ns.Contains("Dispositivo"))
            return false;

        return true;
    }
}
