using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TransporteEscolar.Domain.Entities;

namespace TransporteEscolar.Infrastructure.Persistence.Configurations;

public class FaltaConfiguration : IEntityTypeConfiguration<Falta>
{
    public void Configure(EntityTypeBuilder<Falta> builder)
    {
        builder.HasKey(f => f.Id);
        builder.Property(f => f.AlunoNome).HasMaxLength(200).IsRequired();
        builder.Property(f => f.Motivo).HasMaxLength(500).IsRequired(false);
        builder.HasIndex(f => new { f.TransportadorId, f.Data });
        builder.HasIndex(f => new { f.AlunoId, f.Data }).IsUnique();
    }
}
