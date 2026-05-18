using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Responsaveis.Queries.BuscarPorCPF;

public class BuscarResponsavelPorCPFHandler : IRequestHandler<BuscarResponsavelPorCPFQuery, Result<ResponsavelResumoDto>>
{
    private readonly IResponsavelRepository _repo;

    public BuscarResponsavelPorCPFHandler(IResponsavelRepository repo) => _repo = repo;

    public async Task<Result<ResponsavelResumoDto>> Handle(BuscarResponsavelPorCPFQuery request, CancellationToken ct)
    {
        var cpfDigits = new string(request.CPF.Where(char.IsDigit).ToArray());
        var responsavel = await _repo.ObterPorCPFAsync(cpfDigits, ct);

        if (responsavel is null)
            return Result<ResponsavelResumoDto>.Failure("Responsável não encontrado.");

        return Result<ResponsavelResumoDto>.Success(
            new ResponsavelResumoDto(responsavel.Nome, responsavel.Telefone, responsavel.Email));
    }
}
