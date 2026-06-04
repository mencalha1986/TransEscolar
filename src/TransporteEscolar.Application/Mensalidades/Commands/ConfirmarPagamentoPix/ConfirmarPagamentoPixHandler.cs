using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Mensalidades.Commands.ConfirmarPagamentoPix;

public class ConfirmarPagamentoPixHandler : IRequestHandler<ConfirmarPagamentoPixCommand, Result<bool>>
{
    private readonly IMensalidadeRepository _repo;
    private readonly IUnitOfWork _uow;

    public ConfirmarPagamentoPixHandler(IMensalidadeRepository repo, IUnitOfWork uow)
        => (_repo, _uow) = (repo, uow);

    public async Task<Result<bool>> Handle(ConfirmarPagamentoPixCommand request, CancellationToken ct)
    {
        var mensalidade = await _repo.ObterPorPixCobrancaIdAsync(request.PixCobrancaId, ct);
        if (mensalidade is null)
            return Result<bool>.Failure("Mensalidade não encontrada para esta cobrança PIX.");

        var resultado = mensalidade.RegistrarPagamento(DateOnly.FromDateTime(DateTime.UtcNow));
        if (!resultado.IsSuccess)
            return Result<bool>.Failure(resultado.Error);

        await _uow.CommitAsync(ct);
        return Result<bool>.Success(true);
    }
}
