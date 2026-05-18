using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Entities;
using TransporteEscolar.Domain.Interfaces;
using TransporteEscolar.Domain.ValueObjects;

namespace TransporteEscolar.Application.Alunos.Commands.CadastrarAluno;

public class CadastrarAlunoHandler : IRequestHandler<CadastrarAlunoCommand, Result<Guid>>
{
    private readonly IAlunoRepository _repo;
    private readonly IResponsavelRepository _responsavelRepo;
    private readonly IUsuarioRepository _usuarioRepo;
    private readonly IPasswordHasher _hasher;
    private readonly IEmailService _emailService;
    private readonly IUnitOfWork _uow;
    private readonly ICurrentTenantService _tenant;

    public CadastrarAlunoHandler(
        IAlunoRepository repo,
        IResponsavelRepository responsavelRepo,
        IUsuarioRepository usuarioRepo,
        IPasswordHasher hasher,
        IEmailService emailService,
        IUnitOfWork uow,
        ICurrentTenantService tenant)
        => (_repo, _responsavelRepo, _usuarioRepo, _hasher, _emailService, _uow, _tenant)
           = (repo, responsavelRepo, usuarioRepo, hasher, emailService, uow, tenant);

    public async Task<Result<Guid>> Handle(CadastrarAlunoCommand request, CancellationToken ct)
    {
        if (_tenant.TenantId is not Guid transportadorId)
            return Result<Guid>.Failure("Tenant não identificado. Operação não permitida para SuperAdmin.");

        var alunoResult = Aluno.Criar(request.Nome, request.DataNascimento, request.EscolaId, request.ValorMensalidade, request.DiaVencimento, request.Turno, transportadorId, request.Foto);
        if (!alunoResult.IsSuccess)
            return Result<Guid>.Failure(alunoResult.Error);

        var aluno = alunoResult.Value;
        await _repo.AdicionarAsync(aluno, ct);

        // Cria ou reutiliza o Responsavel e associa ao aluno
        if (!string.IsNullOrWhiteSpace(request.CpfResponsavel))
        {
            var cpfDigits = new string(request.CpfResponsavel.Where(char.IsDigit).ToArray());
            var cpfResult = CPF.Create(cpfDigits);
            if (!cpfResult.IsSuccess)
                return Result<Guid>.Failure(cpfResult.Error);

            var responsavel = await _responsavelRepo.ObterPorCPFAsync(cpfDigits, ct);
            if (responsavel is null)
            {
                var responsavelResult = Responsavel.Criar(
                    request.NomeResponsavel,
                    cpfResult.Value,
                    request.TelefoneResponsavel,
                    request.EmailResponsavel.ToLowerInvariant(),
                    transportadorId);

                if (!responsavelResult.IsSuccess)
                    return Result<Guid>.Failure(responsavelResult.Error);

                responsavel = responsavelResult.Value;
                await _responsavelRepo.AdicionarAsync(responsavel, ct);
            }

            aluno.AssociarResponsavel(responsavel.Id);
        }

        // Cria acesso de login para o responsável
        if (!string.IsNullOrWhiteSpace(request.EmailResponsavel))
        {
            var emailNormalizado = request.EmailResponsavel.ToLowerInvariant();
            if (!await _usuarioRepo.ExisteEmailAsync(emailNormalizado, ct))
            {
                var senhaTemporaria = GerarSenhaAleatoria();
                var hash = _hasher.Hash(senhaTemporaria);
                var usuarioResult = Usuario.Criar(request.NomeResponsavel, emailNormalizado, hash, PerfilUsuario.Responsavel, transportadorId, mustChangePassword: true);
                if (usuarioResult.IsSuccess)
                {
                    await _usuarioRepo.AdicionarAsync(usuarioResult.Value, ct);
                    await _uow.CommitAsync(ct);
                    try { await _emailService.EnviarAcessoResponsavelAsync(emailNormalizado, request.NomeResponsavel, senhaTemporaria, ct); }
                    catch { /* email falhou, mas o cadastro já foi salvo */ }
                }
                else
                {
                    await _uow.CommitAsync(ct);
                }
            }
            else
            {
                await _uow.CommitAsync(ct);
            }
        }
        else
        {
            await _uow.CommitAsync(ct);
        }

        return Result<Guid>.Success(aluno.Id);
    }

    private static string GerarSenhaAleatoria()
    {
        const string chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
        return new string(Enumerable.Range(0, 8).Select(_ => chars[Random.Shared.Next(chars.Length)]).ToArray());
    }
}
