using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Rotas.Commands.GerenciarAlunosRota;

public class AdicionarAlunoRotaHandler : IRequestHandler<AdicionarAlunoRotaCommand, Result<bool>>
{
    private readonly IRotaRepository _repo;
    private readonly IUnitOfWork _uow;

    public AdicionarAlunoRotaHandler(IRotaRepository repo, IUnitOfWork uow) => (_repo, _uow) = (repo, uow);

    public async Task<Result<bool>> Handle(AdicionarAlunoRotaCommand request, CancellationToken ct)
    {
        var rota = await _repo.ObterPorIdAsync(request.RotaId, ct);
        if (rota is null) return Result<bool>.Failure("Rota não encontrada.");

        rota.AdicionarAluno(request.AlunoId);
        _repo.Atualizar(rota);
        await _uow.CommitAsync(ct);

        return Result<bool>.Success(true);
    }
}

public class RemoverAlunoRotaHandler : IRequestHandler<RemoverAlunoRotaCommand, Result<bool>>
{
    private readonly IRotaRepository _repo;
    private readonly IUnitOfWork _uow;

    public RemoverAlunoRotaHandler(IRotaRepository repo, IUnitOfWork uow) => (_repo, _uow) = (repo, uow);

    public async Task<Result<bool>> Handle(RemoverAlunoRotaCommand request, CancellationToken ct)
    {
        var rota = await _repo.ObterPorIdAsync(request.RotaId, ct);
        if (rota is null) return Result<bool>.Failure("Rota não encontrada.");

        rota.RemoverAluno(request.AlunoId);
        _repo.Atualizar(rota);
        await _uow.CommitAsync(ct);

        return Result<bool>.Success(true);
    }
}
