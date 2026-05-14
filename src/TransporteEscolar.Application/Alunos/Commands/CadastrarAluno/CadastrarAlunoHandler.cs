using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Entities;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Alunos.Commands.CadastrarAluno;

public class CadastrarAlunoHandler : IRequestHandler<CadastrarAlunoCommand, Result<Guid>>
{
    private readonly IAlunoRepository _repo;
    private readonly IUnitOfWork _uow;

    public CadastrarAlunoHandler(IAlunoRepository repo, IUnitOfWork uow)
        => (_repo, _uow) = (repo, uow);

    public async Task<Result<Guid>> Handle(CadastrarAlunoCommand request, CancellationToken ct)
    {
        var result = Aluno.Criar(request.Nome, request.DataNascimento, request.EscolaId, request.Foto);
        if (!result.IsSuccess)
            return Result<Guid>.Failure(result.Error);

        await _repo.AdicionarAsync(result.Value, ct);
        await _uow.CommitAsync(ct);

        return Result<Guid>.Success(result.Value.Id);
    }
}
