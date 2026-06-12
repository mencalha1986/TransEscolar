using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TransporteEscolar.Domain.Entities;

namespace TransporteEscolar.Infrastructure.Persistence.Configurations;

public class ViagemConfiguration : IEntityTypeConfiguration<Viagem>
{
    public void Configure(EntityTypeBuilder<Viagem> builder)
    {
        builder.HasKey(v => v.Id);
        builder.Property(v => v.TransportadorId).IsRequired();
        builder.Property(v => v.Turno).IsRequired();
        builder.Property(v => v.Data).IsRequired();
        builder.Property(v => v.Status).IsRequired();
        builder.Property(v => v.RotaId);
        builder.Property(v => v.MotoristaId);
        builder.HasIndex(v => new { v.TransportadorId, v.Data, v.Turno });
        builder.HasIndex(v => new { v.TransportadorId, v.Status });
        builder.HasIndex(v => new { v.MotoristaId, v.Data, v.Status });
    }
}
