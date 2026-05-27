using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Entities;
using TransporteEscolar.Domain.Interfaces;
using TransporteEscolar.Domain.ValueObjects;

namespace TransporteEscolar.Application.Alunos.Commands.EditarAluno;

public class EditarAlunoHandler : IRequestHandler<EditarAlunoCommand, Result<Guid>>
{
    private readonly IAlunoRepository _repo;
    private readonly IResponsavelRepository _responsavelRepo;
    private readonly IUnitOfWork _uow;

    public EditarAlunoHandler(IAlunoRepository repo, IResponsavelRepository responsavelRepo, IUnitOfWork uow)
        => (_repo, _responsavelRepo, _uow) = (repo, responsavelRepo, uow);

    public async Task<Result<Guid>> Handle(EditarAlunoCommand request, CancellationToken ct)
    {
        var aluno = await _repo.ObterPorIdAsync(request.Id, ct);
        if (aluno is null)
            return Result<Guid>.Failure("Aluno não encontrado.");

        Endereco? endereco = null;
        if (!string.IsNullOrWhiteSpace(request.EnderecoCEP))
        {
            endereco = new Endereco(
                request.EnderecoLogradouro ?? "",
                request.EnderecoNumero ?? "",
                request.EnderecoBairro ?? "",
                request.EnderecoCidade ?? "",
                request.EnderecoEstado ?? "",
                request.EnderecoCEP.Replace("-", "").Trim());
        }

        aluno.Atualizar(request.Nome, request.DataNascimento, request.EscolaId,
            request.ValorMensalidade, request.DiaVencimento, request.Turno, endereco);

        if (request.Foto is { Length: > 0 })
            aluno.AtualizarFoto(request.Foto);

        _repo.Atualizar(aluno);

        if (request.Responsaveis is { Count: > 0 })
        {
            var ids = request.Responsaveis.Select(r => r.Id).ToList();
            var responsaveis = await _responsavelRepo.ListarPorIdsAsync(ids, ct);
            foreach (var resp in responsaveis)
            {
                var dto = request.Responsaveis.First(r => r.Id == resp.Id);
                resp.Atualizar(dto.Nome, dto.Telefone, dto.Email);
                _responsavelRepo.Atualizar(resp);
            }
        }

        if (request.NovoResponsavel is { } novoResp)
        {
            var cpfDigits = new string(novoResp.Cpf.Where(char.IsDigit).ToArray());
            var cpfResult = CPF.Create(cpfDigits);
            if (!cpfResult.IsSuccess)
                return Result<Guid>.Failure(cpfResult.Error);

            var responsavel = await _responsavelRepo.ObterPorCPFAsync(cpfDigits, ct);
            if (responsavel is null)
            {
                var responsavelResult = Responsavel.Criar(novoResp.Nome, cpfResult.Value, novoResp.Telefone, novoResp.Email, aluno.TransportadorId);
                if (!responsavelResult.IsSuccess)
                    return Result<Guid>.Failure(responsavelResult.Error);
                responsavel = responsavelResult.Value;
                await _responsavelRepo.AdicionarAsync(responsavel, ct);
            }

            aluno.AssociarResponsavel(responsavel.Id);
            _repo.Atualizar(aluno);
        }

        await _uow.CommitAsync(ct);

        return Result<Guid>.Success(aluno.Id);
    }
}
