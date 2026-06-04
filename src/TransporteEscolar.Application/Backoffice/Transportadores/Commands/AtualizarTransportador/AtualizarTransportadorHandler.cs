using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Backoffice.Transportadores.Commands.AtualizarTransportador;

public class AtualizarTransportadorHandler : IRequestHandler<AtualizarTransportadorCommand, Result<bool>>
{
    private readonly ITransportadorRepository _repo;
    private readonly IUnitOfWork _uow;

    public AtualizarTransportadorHandler(ITransportadorRepository repo, IUnitOfWork uow)
        => (_repo, _uow) = (repo, uow);

    public async Task<Result<bool>> Handle(AtualizarTransportadorCommand request, CancellationToken ct)
    {
        var transportador = await _repo.ObterPorIdAsync(request.Id, ct);
        if (transportador is null)
            return Result<bool>.Failure("Transportador não encontrado.");

        if (string.IsNullOrWhiteSpace(request.NomeEmpresa))
            return Result<bool>.Failure("Nome da empresa é obrigatório.");
        if (string.IsNullOrWhiteSpace(request.NomeContato))
            return Result<bool>.Failure("Nome do contato é obrigatório.");
        if (string.IsNullOrWhiteSpace(request.Email) || !request.Email.Contains('@'))
            return Result<bool>.Failure("Email inválido.");

        var emailEmUso = await _repo.ExisteEmailAsync(request.Email, ct);
        if (emailEmUso && !string.Equals(transportador.Email, request.Email, StringComparison.OrdinalIgnoreCase))
            return Result<bool>.Failure("Este email já está em uso por outro transportador.");

        transportador.Atualizar(request.NomeEmpresa, request.NomeContato, request.Email, request.Telefone);
        _repo.Atualizar(transportador);
        await _uow.CommitAsync(ct);

        return Result<bool>.Success(true);
    }
}
