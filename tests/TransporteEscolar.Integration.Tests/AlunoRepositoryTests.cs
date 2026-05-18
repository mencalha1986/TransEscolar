using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Testcontainers.PostgreSql;
using TransporteEscolar.Domain.Entities;
using TransporteEscolar.Domain.ValueObjects;
using TransporteEscolar.Infrastructure.Persistence;
using TransporteEscolar.Infrastructure.Repositories;

namespace TransporteEscolar.Integration.Tests;

public class AlunoRepositoryTests : IAsyncLifetime
{
    private static readonly Guid TenantId = Guid.NewGuid();
    private readonly PostgreSqlContainer _pg = new PostgreSqlBuilder().Build();
    private AppDbContext _ctx = null!;

    public async Task InitializeAsync()
    {
        await _pg.StartAsync();
        var opts = new DbContextOptionsBuilder<AppDbContext>()
            .UseNpgsql(_pg.GetConnectionString()).Options;
        _ctx = new AppDbContext(opts);
        await _ctx.Database.MigrateAsync();
    }

    public async Task DisposeAsync()
    {
        await _ctx.DisposeAsync();
        await _pg.DisposeAsync();
    }

    [Fact]
    public async Task AdicionarAluno_DevePersistir()
    {
        var repo = new AlunoRepository(_ctx);
        var escola = Escola.Criar("Escola Teste",
            new Endereco("Rua A", "1", "Centro", "SP", "SP", "01001-000"), "11999999999", TenantId).Value;
        await _ctx.Escolas.AddAsync(escola);
        await _ctx.SaveChangesAsync();

        var aluno = Aluno.Criar("João Silva", new DateTime(2015, 3, 10), escola.Id, 500m, 10, TurnoAluno.Manha, TenantId).Value;
        await repo.AdicionarAsync(aluno);
        await _ctx.CommitAsync();

        var found = await repo.ObterPorIdAsync(aluno.Id);
        found.Should().NotBeNull();
        found!.Nome.Should().Be("João Silva");
        found.Foto.Should().BeNull();
        found.ValorMensalidade.Should().Be(500m);
        found.DiaVencimento.Should().Be(10);
    }

    [Fact]
    public async Task AtualizarFoto_DevePersistirBytesNoBanco()
    {
        var repo = new AlunoRepository(_ctx);
        var escola = Escola.Criar("Escola B",
            new Endereco("Rua B", "2", "Centro", "SP", "SP", "01001-000"), "11999999998", TenantId).Value;
        await _ctx.Escolas.AddAsync(escola);
        await _ctx.SaveChangesAsync();

        var aluno = Aluno.Criar("Maria", new DateTime(2016, 5, 20), escola.Id, 350m, 5, TurnoAluno.Tarde, TenantId).Value;
        await repo.AdicionarAsync(aluno);
        await _ctx.CommitAsync();

        var fotoBytes = new byte[] { 0xFF, 0xD8, 0xFF, 0xE0 };
        aluno.AtualizarFoto(fotoBytes);
        repo.Atualizar(aluno);
        await _ctx.CommitAsync();

        var found = await repo.ObterPorIdAsync(aluno.Id);
        found!.Foto.Should().BeEquivalentTo(fotoBytes);
    }
}
