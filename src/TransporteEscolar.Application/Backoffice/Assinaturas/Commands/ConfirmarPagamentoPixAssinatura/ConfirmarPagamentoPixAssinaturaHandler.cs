using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Entities;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Backoffice.Assinaturas.Commands.ConfirmarPagamentoPixAssinatura;

public class ConfirmarPagamentoPixAssinaturaHandler : IRequestHandler<ConfirmarPagamentoPixAssinaturaCommand, Result<bool>>
{
    private readonly IAssinaturaRepository _repo;
    private readonly IUnitOfWork _uow;

    public ConfirmarPagamentoPixAssinaturaHandler(IAssinaturaRepository repo, IUnitOfWork uow)
        => (_repo, _uow) = (repo, uow);

    public async Task<Result<bool>> Handle(ConfirmarPagamentoPixAssinaturaCommand request, CancellationToken ct)
    {
        var assinatura = await _repo.ObterPorPixCobrancaIdAsync(request.PixCobrancaId, ct);
        if (assinatura is null)
            return Result<bool>.Failure("Assinatura não encontrada para esta cobrança PIX.");

        var now = DateTime.UtcNow;
        var pagamento = PagamentoAssinatura.Criar(
            assinatura.Id,
            assinatura.ValorContratado,
            now.Month,
            now.Year,
            observacao: "Pago via PIX");

        if (!pagamento.IsSuccess)
            return Result<bool>.Failure(pagamento.Error);

        await _repo.AdicionarPagamentoAsync(pagamento.Value, ct);
        assinatura.RegistrarPagamento();
        await _uow.CommitAsync(ct);

        return Result<bool>.Success(true);
    }
}
