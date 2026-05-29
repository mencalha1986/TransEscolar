using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TransporteEscolar.Domain.Entities;

namespace TransporteEscolar.Infrastructure.Persistence.Configurations;

public class DispositivoTokenConfiguration : IEntityTypeConfiguration<DispositivoToken>
{
    public void Configure(EntityTypeBuilder<DispositivoToken> builder)
    {
        builder.HasKey(d => d.Id);
        builder.Property(d => d.UsuarioId).IsRequired();
        builder.Property(d => d.Token).IsRequired().HasMaxLength(512);
        builder.Property(d => d.Plataforma).IsRequired().HasMaxLength(20);
        builder.HasIndex(d => d.UsuarioId);
        builder.HasIndex(d => d.Token);
        builder.HasIndex(d => new { d.UsuarioId, d.Plataforma }).IsUnique();
    }
}
