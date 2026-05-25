using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TransporteEscolar.Domain.Interfaces;
using TransporteEscolar.Infrastructure.Persistence;
using TransporteEscolar.Infrastructure.Repositories;
using TransporteEscolar.Infrastructure.Services;

namespace TransporteEscolar.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration config)
    {
        services.AddHttpContextAccessor();
        services.AddScoped<ICurrentTenantService, CurrentTenantService>();

        services.AddDbContext<AppDbContext>(opts =>
            opts.UseNpgsql(config.GetConnectionString("DefaultConnection")));

        services.AddScoped<IUnitOfWork>(sp => sp.GetRequiredService<AppDbContext>());
        services.AddScoped<IAlunoRepository, AlunoRepository>();
        services.AddScoped<IResponsavelRepository, ResponsavelRepository>();
        services.AddScoped<IEscolaRepository, EscolaRepository>();
        services.AddScoped<ITransporteRepository, TransporteRepository>();
        services.AddScoped<IUsuarioRepository, UsuarioRepository>();
        services.AddScoped<IMensalidadeRepository, MensalidadeRepository>();
        services.AddScoped<ITransportadorRepository, TransportadorRepository>();
        services.AddScoped<IPlanoRepository, PlanoRepository>();
        services.AddScoped<IAssinaturaRepository, AssinaturaRepository>();
        services.AddScoped<IRecadoRepository, RecadoRepository>();
        services.AddScoped<IEmailLogRepository, EmailLogRepository>();
        services.AddScoped<ITokenService, TokenService>();
        services.AddScoped<IPasswordHasher, PasswordHasher>();
        services.AddScoped<IEmailService, EmailService>();
        services.AddScoped<IViagemRepository, ViagemRepository>();
        services.AddHttpClient<IGeocodingService, NominatimGeocodingService>(client =>
        {
            client.DefaultRequestHeaders.Add("User-Agent", "TransporteEscolar/1.0");
        });

        return services;
    }
}
