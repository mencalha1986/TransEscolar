using FluentAssertions;
using NSubstitute;
using TransporteEscolar.Application.Alunos.Commands.CadastrarAluno;
using TransporteEscolar.Domain.Entities;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Tests.Alunos;

public class CadastrarAlunoHandlerTests
{
    private readonly IAlunoRepository _repo = Substitute.For<IAlunoRepository>();
    private readonly IUnitOfWork _uow = Substitute.For<IUnitOfWork>();
    private readonly CadastrarAlunoHandler _handler;

    public CadastrarAlunoHandlerTests()
        => _handler = new CadastrarAlunoHandler(_repo, _uow);

    [Fact]
    public async Task Handle_ValidCommand_ReturnsSuccess()
    {
        var cmd = new CadastrarAlunoCommand("João Silva", new DateTime(2015, 3, 10), Guid.NewGuid());
        var result = await _handler.Handle(cmd, CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBe(Guid.Empty);
        await _repo.Received(1).AdicionarAsync(Arg.Any<Aluno>(), Arg.Any<CancellationToken>());
        await _uow.Received(1).CommitAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_NomeVazio_ReturnsFalha()
    {
        var cmd = new CadastrarAlunoCommand("", new DateTime(2015, 3, 10), Guid.NewGuid());
        var result = await _handler.Handle(cmd, CancellationToken.None);
        result.IsSuccess.Should().BeFalse();
    }
}
