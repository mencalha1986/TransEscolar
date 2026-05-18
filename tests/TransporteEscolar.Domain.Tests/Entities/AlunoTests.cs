using FluentAssertions;
using TransporteEscolar.Domain.Entities;

namespace TransporteEscolar.Domain.Tests.Entities;

public class AlunoTests
{
    private static readonly Guid _tenantId = Guid.NewGuid();

    [Fact]
    public void Criar_AlunoValido_DeveRetornarInstancia()
    {
        var aluno = Aluno.Criar("João Silva", new DateTime(2015, 3, 10), Guid.NewGuid(), 500m, 10, TurnoAluno.Manha, _tenantId);
        aluno.IsSuccess.Should().BeTrue();
        aluno.Value.Nome.Should().Be("João Silva");
        aluno.Value.Foto.Should().BeNull();
        aluno.Value.ValorMensalidade.Should().Be(500m);
        aluno.Value.DiaVencimento.Should().Be(10);
        aluno.Value.Turno.Should().Be(TurnoAluno.Manha);
    }

    [Fact]
    public void Criar_NomeVazio_DeveFalhar()
    {
        var result = Aluno.Criar("", new DateTime(2015, 3, 10), Guid.NewGuid(), 500m, 10, TurnoAluno.Tarde, _tenantId);
        result.IsSuccess.Should().BeFalse();
    }

    [Fact]
    public void Criar_DataNascimentoFutura_DeveFalhar()
    {
        var result = Aluno.Criar("João", DateTime.UtcNow.AddDays(1), Guid.NewGuid(), 500m, 10, TurnoAluno.Manha, _tenantId);
        result.IsSuccess.Should().BeFalse();
    }

    [Fact]
    public void AssociarResponsavel_DeveAdicionarNaLista()
    {
        var aluno = Aluno.Criar("João Silva", new DateTime(2015, 3, 10), Guid.NewGuid(), 500m, 10, TurnoAluno.Manha, _tenantId).Value;
        aluno.AssociarResponsavel(Guid.NewGuid());
        aluno.ResponsavelIds.Should().HaveCount(1);
    }

    [Fact]
    public void AtualizarFoto_DeveDefinirBytes()
    {
        var aluno = Aluno.Criar("João", new DateTime(2015, 3, 10), Guid.NewGuid(), 500m, 10, TurnoAluno.Noturno, _tenantId).Value;
        var bytes = new byte[] { 0xFF, 0xD8, 0xFF };
        aluno.AtualizarFoto(bytes);
        aluno.Foto.Should().BeEquivalentTo(bytes);
    }
}
