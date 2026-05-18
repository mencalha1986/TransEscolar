using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Entities;
using TransporteEscolar.Domain.Interfaces;
using TransporteEscolar.Domain.ValueObjects;

namespace TransporteEscolar.Application.Escolas.Commands.CadastrarEscola;

public class CadastrarEscolaHandler : IRequestHandler<CadastrarEscolaCommand, Result<Guid>>
{
    private readonly IEscolaRepository _repo;
    private readonly IUnitOfWork _uow;
    private readonly ICurrentTenantService _tenant;

    public CadastrarEscolaHandler(IEscolaRepository repo, IUnitOfWork uow, ICurrentTenantService tenant)
        => (_repo, _uow, _tenant) = (repo, uow, tenant);

    public async Task<Result<Guid>> Handle(CadastrarEscolaCommand request, CancellationToken ct)
    {
        if (_tenant.TenantId is not Guid transportadorId)
            return Result<Guid>.Failure("Tenant não identificado.");

        var endereco = new Endereco(request.Logradouro, request.Numero, request.Bairro, request.Cidade, request.Estado, request.CEP);
        var result = Escola.Criar(request.Nome, endereco, request.Telefone, transportadorId);
        if (!result.IsSuccess)
            return Result<Guid>.Failure(result.Error);

        await _repo.AdicionarAsync(result.Value, ct);
        await _uow.CommitAsync(ct);

        return Result<Guid>.Success(result.Value.Id);
    }
}
