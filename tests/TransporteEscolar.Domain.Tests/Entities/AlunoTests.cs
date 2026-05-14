using FluentAssertions;
using TransporteEscolar.Domain.Entities;

namespace TransporteEscolar.Domain.Tests.Entities;

public class AlunoTests
{
    [Fact]
    public void Criar_AlunoValido_DeveRetornarInstancia()
    {
        var aluno = Aluno.Criar("João Silva", new DateTime(2015, 3, 10), Guid.NewGuid());
        aluno.IsSuccess.Should().BeTrue();
        aluno.Value.Nome.Should().Be("João Silva");
        aluno.Value.Foto.Should().BeNull();
    }

    [Fact]
    public void Criar_NomeVazio_DeveFalhar()
    {
        var result = Aluno.Criar("", new DateTime(2015, 3, 10), Guid.NewGuid());
        result.IsSuccess.Should().BeFalse();
    }

    [Fact]
    public void Criar_DataNascimentoFutura_DeveFalhar()
    {
        var result = Aluno.Criar("João", DateTime.UtcNow.AddDays(1), Guid.NewGuid());
        result.IsSuccess.Should().BeFalse();
    }

    [Fact]
    public void AssociarResponsavel_DeveAdicionarNaLista()
    {
        var aluno = Aluno.Criar("João Silva", new DateTime(2015, 3, 10), Guid.NewGuid()).Value;
        aluno.AssociarResponsavel(Guid.NewGuid());
        aluno.ResponsavelIds.Should().HaveCount(1);
    }

    [Fact]
    public void AtualizarFoto_DeveDefinirBytes()
    {
        var aluno = Aluno.Criar("João", new DateTime(2015, 3, 10), Guid.NewGuid()).Value;
        var bytes = new byte[] { 0xFF, 0xD8, 0xFF };
        aluno.AtualizarFoto(bytes);
        aluno.Foto.Should().BeEquivalentTo(bytes);
    }
}
