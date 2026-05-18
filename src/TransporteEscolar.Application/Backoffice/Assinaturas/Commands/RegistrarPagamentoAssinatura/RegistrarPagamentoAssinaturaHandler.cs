using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Entities;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Backoffice.Assinaturas.Commands.RegistrarPagamentoAssinatura;

public class RegistrarPagamentoAssinaturaHandler : IRequestHandler<RegistrarPagamentoAssinaturaCommand, Result<Guid>>
{
    private readonly IAssinaturaRepository _repo;
    private readonly IUnitOfWork _uow;

    public RegistrarPagamentoAssinaturaHandler(IAssinaturaRepository repo, IUnitOfWork uow)
        => (_repo, _uow) = (repo, uow);

    public async Task<Result<Guid>> Handle(RegistrarPagamentoAssinaturaCommand request, CancellationToken ct)
    {
        var assinatura = await _repo.ObterPorIdAsync(request.AssinaturaId, ct);
        if (assinatura is null)
            return Result<Guid>.Failure("Assinatura não encontrada.");

        var pagResult = PagamentoAssinatura.Criar(
            request.AssinaturaId, request.ValorPago,
            request.CompetenciaMes, request.CompetenciaAno, request.Observacao);

        if (!pagResult.IsSuccess)
            return Result<Guid>.Failure(pagResult.Error);

        assinatura.RegistrarPagamento();
        _repo.Atualizar(assinatura);

        await _repo.AdicionarPagamentoAsync(pagResult.Value, ct);
        await _uow.CommitAsync(ct);

        return Result<Guid>.Success(pagResult.Value.Id);
    }
}
