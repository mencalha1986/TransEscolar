using FluentAssertions;
using NSubstitute;
using TransporteEscolar.Application.Alunos.Commands.CadastrarAluno;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Entities;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Tests.Alunos;

public class CadastrarAlunoHandlerTests
{
    private readonly IAlunoRepository _repo = Substitute.For<IAlunoRepository>();
    private readonly IResponsavelRepository _responsavelRepo = Substitute.For<IResponsavelRepository>();
    private readonly IUsuarioRepository _usuarioRepo = Substitute.For<IUsuarioRepository>();
    private readonly IPasswordHasher _hasher = Substitute.For<IPasswordHasher>();
    private readonly IEmailService _emailService = Substitute.For<IEmailService>();
    private readonly IEmailLogRepository _emailLogRepo = Substitute.For<IEmailLogRepository>();
    private readonly IUnitOfWork _uow = Substitute.For<IUnitOfWork>();
    private readonly ICurrentTenantService _tenant = Substitute.For<ICurrentTenantService>();
    private readonly IAssinaturaRepository _assinaturaRepo = Substitute.For<IAssinaturaRepository>();
    private readonly IPlanoRepository _planoRepo = Substitute.For<IPlanoRepository>();
    private readonly ITransportadorRepository _transportadorRepo = Substitute.For<ITransportadorRepository>();
    private readonly Microsoft.Extensions.Logging.ILogger<CadastrarAlunoHandler> _logger =
        Substitute.For<Microsoft.Extensions.Logging.ILogger<CadastrarAlunoHandler>>();
    private readonly CadastrarAlunoHandler _handler;

    public CadastrarAlunoHandlerTests()
    {
        _tenant.TenantId.Returns(Guid.NewGuid());
        // Sem assinatura → sem limite (comportamento padrão para testes existentes)
        _assinaturaRepo.ObterPorTransportadorAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>()).Returns((Assinatura?)null);
        _handler = new CadastrarAlunoHandler(_repo, _responsavelRepo, _usuarioRepo, _hasher, _emailService, _emailLogRepo, _uow, _tenant, _assinaturaRepo, _planoRepo, _transportadorRepo, _logger);
    }

    [Fact]
    public async Task Handle_ValidCommand_ReturnsSuccess()
    {
        var cmd = new CadastrarAlunoCommand("João Silva", new DateTime(2015, 3, 10), Guid.NewGuid(), 500m, 10, TurnoAluno.Manha);
        var result = await _handler.Handle(cmd, CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBe(Guid.Empty);
        await _repo.Received(1).AdicionarAsync(Arg.Any<Aluno>(), Arg.Any<CancellationToken>());
        await _uow.Received(1).CommitAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_NomeVazio_ReturnsFalha()
    {
        var cmd = new CadastrarAlunoCommand("", new DateTime(2015, 3, 10), Guid.NewGuid(), 500m, 10, TurnoAluno.Manha);
        var result = await _handler.Handle(cmd, CancellationToken.None);
        result.IsSuccess.Should().BeFalse();
    }

    [Fact]
    public async Task Handle_ComEmailResponsavel_CriaUsuarioEEnviaEmail()
    {
        _usuarioRepo.ExisteEmailAsync(Arg.Any<string>(), Arg.Any<CancellationToken>()).Returns(false);
        _hasher.Hash(Arg.Any<string>()).Returns("hash_fake");

        var cmd = new CadastrarAlunoCommand("Maria", new DateTime(2016, 5, 20), Guid.NewGuid(), 350m, 5, TurnoAluno.Tarde, "resp@email.com", "Responsável Teste");
        var result = await _handler.Handle(cmd, CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        await _usuarioRepo.Received(1).AdicionarAsync(Arg.Any<Usuario>(), Arg.Any<CancellationToken>());
        await _emailService.Received(1).EnviarAcessoResponsavelAsync(
            "resp@email.com", Arg.Any<string>(), Arg.Any<string>(), Arg.Any<CancellationToken>());
    }
}
