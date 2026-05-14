using FluentAssertions;
using TransporteEscolar.Domain.ValueObjects;

namespace TransporteEscolar.Domain.Tests.ValueObjects;

public class CPFTests
{
    [Theory]
    [InlineData("529.982.247-25")]
    [InlineData("52998224725")]
    public void Create_ValidCPF_ShouldSucceed(string value)
    {
        var cpf = CPF.Create(value);
        cpf.IsSuccess.Should().BeTrue();
        cpf.Value.Numero.Should().Be("52998224725");
    }

    [Theory]
    [InlineData("000.000.000-00")]
    [InlineData("123.456.789-00")]
    [InlineData("")]
    [InlineData(null)]
    public void Create_InvalidCPF_ShouldFail(string value)
    {
        var cpf = CPF.Create(value);
        cpf.IsSuccess.Should().BeFalse();
    }

    [Fact]
    public void TwoCPFsWithSameNumber_ShouldBeEqual()
    {
        var a = CPF.Create("529.982.247-25").Value;
        var b = CPF.Create("52998224725").Value;
        a.Should().Be(b);
    }
}
