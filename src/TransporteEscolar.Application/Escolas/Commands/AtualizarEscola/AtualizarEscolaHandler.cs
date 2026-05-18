using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Interfaces;
using TransporteEscolar.Domain.ValueObjects;

namespace TransporteEscolar.Application.Escolas.Commands.AtualizarEscola;

public class AtualizarEscolaHandler : IRequestHandler<AtualizarEscolaCommand, Result<bool>>
{
    private readonly IEscolaRepository _repo;
    private readonly IUnitOfWork _uow;
    private readonly ICurrentTenantService _tenant;

    public AtualizarEscolaHandler(IEscolaRepository repo, IUnitOfWork uow, ICurrentTenantService tenant)
        => (_repo, _uow, _tenant) = (repo, uow, tenant);

    public async Task<Result<bool>> Handle(AtualizarEscolaCommand request, CancellationToken ct)
    {
        if (_tenant.TenantId is not Guid transportadorId)
            return Result<bool>.Failure("Tenant não identificado.");

        var escola = await _repo.ObterPorIdAsync(request.Id, ct);
        if (escola is null)
            return Result<bool>.Failure("Escola não encontrada.");

        if (escola.TransportadorId != transportadorId)
            return Result<bool>.Failure("Escola não pertence ao transportador.");

        var endereco = new Endereco(request.Logradouro, request.Numero, request.Bairro, request.Cidade, request.Estado, request.CEP);
        var result = escola.Atualizar(request.Nome, endereco, request.Telefone);
        if (!result.IsSuccess)
            return Result<bool>.Failure(result.Error);

        _repo.Atualizar(escola);
        await _uow.CommitAsync(ct);

        return Result<bool>.Success(true);
    }
}
