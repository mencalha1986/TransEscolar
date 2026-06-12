using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Entities;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Motoristas.Commands.CriarMotorista;

public class CriarMotoristaHandler : IRequestHandler<CriarMotoristaCommand, Result<Guid>>
{
    private readonly IMotoristaRepository _repo;
    private readonly IUnitOfWork _uow;
    private readonly ICurrentTenantService _tenant;

    public CriarMotoristaHandler(IMotoristaRepository repo, IUnitOfWork uow, ICurrentTenantService tenant)
        => (_repo, _uow, _tenant) = (repo, uow, tenant);

    public async Task<Result<Guid>> Handle(CriarMotoristaCommand request, CancellationToken ct)
    {
        if (_tenant.TenantId is not Guid transportadorId)
            return Result<Guid>.Failure("Tenant não identificado.");

        if (await _repo.ExisteCpfAsync(request.Cpf, transportadorId, ct))
            return Result<Guid>.Failure("Já existe um motorista com este CPF.");

        var result = Motorista.Criar(request.Nome, request.Cpf, transportadorId, request.Cnh, request.Telefone);
        if (!result.IsSuccess)
            return Result<Guid>.Failure(result.Error);

        await _repo.AdicionarAsync(result.Value, ct);
        await _uow.CommitAsync(ct);

        return Result<Guid>.Success(result.Value.Id);
    }
}
