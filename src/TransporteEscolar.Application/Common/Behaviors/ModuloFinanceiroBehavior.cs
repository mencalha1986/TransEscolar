using MediatR;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Common.Behaviors;

public class ModuloFinanceiroBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    private readonly ICurrentTenantService _tenant;

    public ModuloFinanceiroBehavior(ICurrentTenantService tenant) => _tenant = tenant;

    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken ct)
    {
        if (!DeveVerificar())
            return await next();

        if (!_tenant.ModuloFinanceiroAtivo)
            throw new ModuloFinanceiroInativoException();

        return await next();
    }

    private bool DeveVerificar()
    {
        if (_tenant.TenantId is null || _tenant.IsSuperAdmin)
            return false;

        var ns = typeof(TRequest).Namespace ?? string.Empty;
        return ns.Contains("Financeiro");
    }
}
