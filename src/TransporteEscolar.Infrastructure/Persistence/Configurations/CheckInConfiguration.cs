using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TransporteEscolar.Domain.Entities;

namespace TransporteEscolar.Infrastructure.Persistence.Configurations;

public class CheckInConfiguration : IEntityTypeConfiguration<CheckIn>
{
    public void Configure(EntityTypeBuilder<CheckIn> builder)
    {
        builder.HasKey(c => c.Id);
        builder.Property(c => c.AlunoId).IsRequired();
        builder.Property(c => c.Tipo).IsRequired();
        builder.Property(c => c.HoraRegistro).IsRequired();
        builder.Property(c => c.Endereco).HasMaxLength(500).IsRequired(false);
        builder.Property(c => c.ViagemId).IsRequired(false);
        builder.HasIndex(c => c.AlunoId);
        builder.HasIndex(c => new { c.TransportadorId, c.HoraRegistro });
        builder.HasIndex(c => c.ViagemId);
    }
}
