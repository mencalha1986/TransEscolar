using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Mensalidades.Commands.RegistrarPagamento;

public class RegistrarPagamentoHandler : IRequestHandler<RegistrarPagamentoCommand, Result<bool>>
{
    private readonly IMensalidadeRepository _repo;
    private readonly IUnitOfWork _uow;

    public RegistrarPagamentoHandler(IMensalidadeRepository repo, IUnitOfWork uow)
        => (_repo, _uow) = (repo, uow);

    public async Task<Result<bool>> Handle(RegistrarPagamentoCommand request, CancellationToken ct)
    {
        var mensalidade = await _repo.ObterPorIdAsync(request.MensalidadeId, ct);
        if (mensalidade is null)
            return Result<bool>.Failure("Mensalidade não encontrada.");

        var result = mensalidade.RegistrarPagamento(request.DataPagamento);
        if (!result.IsSuccess)
            return Result<bool>.Failure(result.Error);

        _repo.Atualizar(mensalidade);
        await _uow.CommitAsync(ct);

        return Result<bool>.Success(true);
    }
}
