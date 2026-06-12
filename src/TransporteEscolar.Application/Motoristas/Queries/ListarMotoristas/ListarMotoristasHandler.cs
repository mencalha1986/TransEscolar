using MediatR;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Motoristas.Queries.ListarMotoristas;

public class ListarMotoristasHandler : IRequestHandler<ListarMotoristasQuery, IEnumerable<MotoristaDto>>
{
    private readonly IMotoristaRepository _repo;
    private readonly ICurrentTenantService _tenant;

    public ListarMotoristasHandler(IMotoristaRepository repo, ICurrentTenantService tenant)
        => (_repo, _tenant) = (repo, tenant);

    public async Task<IEnumerable<MotoristaDto>> Handle(ListarMotoristasQuery request, CancellationToken ct)
    {
        if (_tenant.TenantId is not Guid transportadorId)
            return [];

        var motoristas = await _repo.ListarPorTransportadorAsync(transportadorId, ct);
        return motoristas.Select(m => new MotoristaDto(m.Id, m.Nome, m.Cpf, m.Cnh, m.Telefone, m.Ativo, m.CriadoEm));
    }
}
