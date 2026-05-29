using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
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
        // Firebase inicializado uma única vez no startup — evita crash em cascata por instância Scoped
        try
        {
            var jsonBase64 = config["Firebase:ServiceAccountJsonBase64"];
            if (!string.IsNullOrWhiteSpace(jsonBase64))
            {
                var json = System.Text.Encoding.UTF8.GetString(Convert.FromBase64String(jsonBase64));
#pragma warning disable CS0618
                FirebaseApp.Create(new AppOptions { Credential = GoogleCredential.FromJson(json) });
#pragma warning restore CS0618
            }
            else
            {
                var path = config["Firebase:ServiceAccountPath"];
                if (!string.IsNullOrWhiteSpace(path) && File.Exists(path))
#pragma warning disable CS0618
                    FirebaseApp.Create(new AppOptions { Credential = GoogleCredential.FromFile(path) });
#pragma warning restore CS0618
            }
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"[Firebase] Falha ao inicializar: {ex.Message}");
        }

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
        services.AddScoped<IViagemPercursoRepository, ViagemPercursoRepository>();
        services.AddScoped<IFaltaRepository, FaltaRepository>();
        services.AddScoped<IDispositivoTokenRepository, DispositivoTokenRepository>();
        services.AddScoped<INotificacaoPushService, FirebasePushService>();
        services.AddHttpClient<IGeocodingService, NominatimGeocodingService>(client =>
        {
            client.DefaultRequestHeaders.Add("User-Agent", "TransporteEscolar/1.0");
        });

        return services;
    }
}
