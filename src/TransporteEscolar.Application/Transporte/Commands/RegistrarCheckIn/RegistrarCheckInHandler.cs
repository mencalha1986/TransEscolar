using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Entities;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Transporte.Commands.RegistrarCheckIn;

public class RegistrarCheckInHandler : IRequestHandler<RegistrarCheckInCommand, Result<Guid>>
{
    private readonly ITransporteRepository _repo;
    private readonly IUnitOfWork _uow;
    private readonly ICurrentTenantService _tenant;

    public RegistrarCheckInHandler(ITransporteRepository repo, IUnitOfWork uow, ICurrentTenantService tenant)
        => (_repo, _uow, _tenant) = (repo, uow, tenant);

    public async Task<Result<Guid>> Handle(RegistrarCheckInCommand request, CancellationToken ct)
    {
        if (!_tenant.TenantId.HasValue)
            return Result<Guid>.Failure("Usuário sem transportador associado.");

        var checkIn = CheckIn.Registrar(request.AlunoId, request.Tipo,
            _tenant.TenantId.Value, request.Latitude, request.Longitude);

        await _repo.AdicionarCheckInAsync(checkIn, ct);
        await _uow.CommitAsync(ct);

        return Result<Guid>.Success(checkIn.Id);
    }
}
