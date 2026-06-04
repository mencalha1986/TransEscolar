using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Entities;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Backoffice.Planos.Commands.CriarPlano;

public class CriarPlanoHandler : IRequestHandler<CriarPlanoCommand, Result<Guid>>
{
    private readonly IPlanoRepository _repo;
    private readonly IUnitOfWork _uow;

    public CriarPlanoHandler(IPlanoRepository repo, IUnitOfWork uow) => (_repo, _uow) = (repo, uow);

    public async Task<Result<Guid>> Handle(CriarPlanoCommand request, CancellationToken ct)
    {
        var result = Plano.Criar(request.Nome, request.PrecoMensal, request.LimiteAlunos, request.Descricao, request.LimiteRotas, request.RetencaoHistoricoDias);
        if (!result.IsSuccess)
            return Result<Guid>.Failure(result.Error);

        await _repo.AdicionarAsync(result.Value, ct);
        await _uow.CommitAsync(ct);

        return Result<Guid>.Success(result.Value.Id);
    }
}
