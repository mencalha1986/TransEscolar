using Microsoft.EntityFrameworkCore;
using TransporteEscolar.Domain.Entities;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Infrastructure.Persistence;

public class AppDbContext : DbContext, IUnitOfWork
{
    private readonly ICurrentTenantService? _tenantService;

    public AppDbContext(DbContextOptions<AppDbContext> options, ICurrentTenantService? tenantService = null)
        : base(options)
    {
        _tenantService = tenantService;
    }

    public DbSet<Aluno> Alunos => Set<Aluno>();
    public DbSet<Responsavel> Responsaveis => Set<Responsavel>();
    public DbSet<Escola> Escolas => Set<Escola>();
    public DbSet<Transporte> Transportes => Set<Transporte>();
    public DbSet<CheckIn> CheckIns => Set<CheckIn>();
    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<Mensalidade> Mensalidades => Set<Mensalidade>();
    public DbSet<Transportador> Transportadores => Set<Transportador>();
    public DbSet<Plano> Planos => Set<Plano>();
    public DbSet<Assinatura> Assinaturas => Set<Assinatura>();
    public DbSet<PagamentoAssinatura> PagamentosAssinatura => Set<PagamentoAssinatura>();
    public DbSet<Recado> Recados => Set<Recado>();
    public DbSet<EmailLog> EmailLogs => Set<EmailLog>();
    public DbSet<Viagem> Viagens => Set<Viagem>();
    public DbSet<ViagemPercurso> ViagemPercursos => Set<ViagemPercurso>();
    public DbSet<Falta> Faltas => Set<Falta>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
        ApplyTenantFilters(modelBuilder);
    }

    // Propriedades avaliadas a cada query (não cached pelo EF Core model)
    private bool CurrentIsSuperAdmin => _tenantService?.IsSuperAdmin ?? false;
    private Guid? CurrentTenantId => _tenantService?.TenantId;
    // Versão segura para uso no HasQueryFilter — nunca lança NullReferenceException
    private Guid CurrentTenantIdOrEmpty => _tenantService?.TenantId ?? Guid.Empty;

    private void ApplyTenantFilters(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Aluno>().HasQueryFilter(e =>
            CurrentIsSuperAdmin || CurrentTenantId == null || e.TransportadorId == CurrentTenantIdOrEmpty);

        modelBuilder.Entity<Escola>().HasQueryFilter(e =>
            CurrentIsSuperAdmin || CurrentTenantId == null || e.TransportadorId == CurrentTenantIdOrEmpty);

        modelBuilder.Entity<Responsavel>().HasQueryFilter(e =>
            CurrentIsSuperAdmin || CurrentTenantId == null || e.TransportadorId == CurrentTenantIdOrEmpty);

        modelBuilder.Entity<Transporte>().HasQueryFilter(e =>
            CurrentIsSuperAdmin || CurrentTenantId == null || e.TransportadorId == CurrentTenantIdOrEmpty);

        modelBuilder.Entity<CheckIn>().HasQueryFilter(e =>
            CurrentIsSuperAdmin || CurrentTenantId == null || e.TransportadorId == CurrentTenantIdOrEmpty);

        modelBuilder.Entity<Mensalidade>().HasQueryFilter(e =>
            CurrentIsSuperAdmin || CurrentTenantId == null || e.TransportadorId == CurrentTenantIdOrEmpty);

        modelBuilder.Entity<Usuario>().HasQueryFilter(e =>
            CurrentIsSuperAdmin || CurrentTenantId == null || e.TransportadorId == null || e.TransportadorId == CurrentTenantIdOrEmpty);

        modelBuilder.Entity<Recado>().HasQueryFilter(e =>
            CurrentIsSuperAdmin || CurrentTenantId == null || e.TransportadorId == CurrentTenantIdOrEmpty);

        modelBuilder.Entity<Viagem>().HasQueryFilter(e =>
            CurrentIsSuperAdmin || CurrentTenantId == null || e.TransportadorId == CurrentTenantIdOrEmpty);

        modelBuilder.Entity<Falta>().HasQueryFilter(e =>
            CurrentIsSuperAdmin || CurrentTenantId == null || e.TransportadorId == CurrentTenantIdOrEmpty);
    }

    public async Task<int> CommitAsync(CancellationToken ct = default) => await SaveChangesAsync(ct);
}
