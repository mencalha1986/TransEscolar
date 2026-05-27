using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Alunos.Queries.ObterAluno;

public class ObterAlunoHandler : IRequestHandler<ObterAlunoQuery, Result<AlunoDetalheDto>>
{
    private readonly IAlunoRepository _repo;
    private readonly IEscolaRepository _escolaRepo;
    private readonly IResponsavelRepository _responsavelRepo;

    public ObterAlunoHandler(IAlunoRepository repo, IEscolaRepository escolaRepo, IResponsavelRepository responsavelRepo)
        => (_repo, _escolaRepo, _responsavelRepo) = (repo, escolaRepo, responsavelRepo);

    public async Task<Result<AlunoDetalheDto>> Handle(ObterAlunoQuery request, CancellationToken ct)
    {
        var aluno = await _repo.ObterPorIdAsync(request.Id, ct);
        if (aluno is null)
            return Result<AlunoDetalheDto>.Failure("Aluno não encontrado.");

        var escola = await _escolaRepo.ObterPorIdAsync(aluno.EscolaId, ct);
        var responsaveis = await _responsavelRepo.ListarPorIdsAsync(aluno.ResponsavelIds, ct);

        var fotoBase64 = aluno.Foto != null ? Convert.ToBase64String(aluno.Foto) : null;

        var responsaveisDtos = responsaveis
            .Select(r => new ResponsavelDto(r.Id, r.Nome, r.CPF.Numero, r.Telefone, r.Email))
            .ToList();

        EnderecoDto? enderecoDto = aluno.Endereco is not null
            ? new EnderecoDto(aluno.Endereco.Logradouro, aluno.Endereco.Numero, aluno.Endereco.Bairro,
                aluno.Endereco.Cidade, aluno.Endereco.Estado, aluno.Endereco.CEP)
            : null;

        var dto = new AlunoDetalheDto(
            aluno.Id, aluno.Nome, aluno.DataNascimento, aluno.EscolaId,
            escola?.Nome ?? aluno.EscolaId.ToString(),
            fotoBase64, aluno.ValorMensalidade, aluno.DiaVencimento, aluno.Turno.ToString(),
            responsaveisDtos, enderecoDto);

        return Result<AlunoDetalheDto>.Success(dto);
    }
}
