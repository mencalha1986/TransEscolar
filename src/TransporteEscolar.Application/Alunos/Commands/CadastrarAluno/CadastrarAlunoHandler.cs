using MediatR;
using Microsoft.Extensions.Logging;
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
    private readonly IEmailLogRepository _emailLogRepo;
    private readonly IUnitOfWork _uow;
    private readonly ICurrentTenantService _tenant;
    private readonly IAssinaturaRepository _assinaturaRepo;
    private readonly IPlanoRepository _planoRepo;
    private readonly ITransportadorRepository _transportadorRepo;
    private readonly ILogger<CadastrarAlunoHandler> _logger;

    public CadastrarAlunoHandler(
        IAlunoRepository repo,
        IResponsavelRepository responsavelRepo,
        IUsuarioRepository usuarioRepo,
        IPasswordHasher hasher,
        IEmailService emailService,
        IEmailLogRepository emailLogRepo,
        IUnitOfWork uow,
        ICurrentTenantService tenant,
        IAssinaturaRepository assinaturaRepo,
        IPlanoRepository planoRepo,
        ITransportadorRepository transportadorRepo,
        ILogger<CadastrarAlunoHandler> logger)
    {
        (_repo, _responsavelRepo, _usuarioRepo, _hasher, _emailService, _emailLogRepo, _uow, _tenant)
           = (repo, responsavelRepo, usuarioRepo, hasher, emailService, emailLogRepo, uow, tenant);
        (_assinaturaRepo, _planoRepo, _transportadorRepo) = (assinaturaRepo, planoRepo, transportadorRepo);
        _logger = logger;
    }

    public async Task<Result<Guid>> Handle(CadastrarAlunoCommand request, CancellationToken ct)
    {
        if (_tenant.TenantId is not Guid transportadorId)
            return Result<Guid>.Failure("Tenant não identificado. Operação não permitida para SuperAdmin.");

        var limitError = await VerificarLimitePlanAsync(transportadorId, ct);
        if (limitError is not null)
            return Result<Guid>.Failure(limitError);

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

        var alunoResult = Aluno.Criar(request.Nome, request.DataNascimento, request.EscolaId, request.ValorMensalidade, request.DiaVencimento, request.Turno, transportadorId, request.Foto, endereco);
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
                var senhaTemporaria = SenhaPadrao;
                var hash = _hasher.Hash(senhaTemporaria);
                var usuarioResult = Usuario.Criar(request.NomeResponsavel, emailNormalizado, hash, PerfilUsuario.Responsavel, transportadorId, mustChangePassword: true);
                if (usuarioResult.IsSuccess)
                {
                    await _usuarioRepo.AdicionarAsync(usuarioResult.Value, ct);
                    var emailLog = EmailLog.Criar(emailNormalizado, request.NomeResponsavel, transportadorId);
                    await _emailLogRepo.AdicionarAsync(emailLog, ct);
                    await _uow.CommitAsync(ct);
                    try
                    {
                        await _emailService.EnviarAcessoResponsavelAsync(emailNormalizado, request.NomeResponsavel, senhaTemporaria, ct);
                        emailLog.MarcarEnviado();
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Falha ao enviar email de acesso para responsável {Email}", emailNormalizado);
                        emailLog.MarcarFalha(ex.Message);
                    }
                    await _uow.CommitAsync(ct);
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

    private async Task<string?> VerificarLimitePlanAsync(Guid transportadorId, CancellationToken ct)
    {
        var transportador = await _transportadorRepo.ObterPorIdAsync(transportadorId, ct);
        if (transportador?.Vitalicio == true)
            return null;

        var assinatura = await _assinaturaRepo.ObterPorTransportadorAsync(transportadorId, ct);
        if (assinatura is null)
            return null;

        var plano = await _planoRepo.ObterPorIdAsync(assinatura.PlanoId, ct);
        if (plano?.LimiteAlunos is not int limite)
            return null;

        var total = await _transportadorRepo.ContarAlunosAsync(transportadorId, ct);
        if (total >= limite)
            return $"Limite de {limite} aluno(s) do plano '{plano.Nome}' atingido. Faça upgrade do plano para adicionar mais alunos.";

        return null;
    }

    private const string SenhaPadrao = "Trans@123";
}
