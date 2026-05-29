using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using TransporteEscolar.Infrastructure.Services;

namespace TransporteEscolar.Integration.Tests.Email;

public class EmailServiceTests
{
    [Fact]
    public async Task EnviarAcessoResponsavel_DeveChegarEmailReal()
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Email:Host"]     = "smtp-relay.brevo.com",
                ["Email:Port"]     = "587",
                ["Email:Username"] = "ac40a3001@smtp-brevo.com",
                ["Email:Password"] = "xsmtpsib-88df404d08b10a306488b1bea625917f6cb1d3072c1eec3980327d727fb2bdd5-rqmYmDSK9IN8XseK",
                ["Email:From"]     = "noreplytransescolar@gmail.com",
                ["Email:FromName"] = "TransporteEscolar"
            })
            .Build();

        var service = new EmailService(config, NullLogger<EmailService>.Instance);

        await service.EnviarAcessoResponsavelAsync(
            email: "romulo_c70@hotmail.com",
            nome:  "Romulo Costa",
            senha: "Teste@123");
    }
}
