using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Entities;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Transporte.Commands.RegistrarCheckIn;

public class RegistrarCheckInHandler : IRequestHandler<RegistrarCheckInCommand, Result<Guid>>
{
    private readonly ITransporteRepository _repo;
    private readonly IUnitOfWork _uow;

    public RegistrarCheckInHandler(ITransporteRepository repo, IUnitOfWork uow)
        => (_repo, _uow) = (repo, uow);

    public async Task<Result<Guid>> Handle(RegistrarCheckInCommand request, CancellationToken ct)
    {
        var transporte = await _repo.ObterPorIdAsync(request.TransporteId, ct);
        if (transporte is null)
            return Result<Guid>.Failure("Transporte não encontrado.");

        var checkIn = CheckIn.Registrar(request.AlunoId, request.TransporteId,
            request.Tipo, request.Latitude, request.Longitude);

        await _repo.AdicionarCheckInAsync(checkIn, ct);
        await _uow.CommitAsync(ct);

        return Result<Guid>.Success(checkIn.Id);
    }
}
