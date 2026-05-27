using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TransporteEscolar.Domain.Entities;

namespace TransporteEscolar.Infrastructure.Persistence.Configurations;

public class ViagemPercursoConfiguration : IEntityTypeConfiguration<ViagemPercurso>
{
    public void Configure(EntityTypeBuilder<ViagemPercurso> builder)
    {
        builder.HasKey(p => p.Id);
        builder.Property(p => p.ViagemId).IsRequired();
        builder.Property(p => p.Latitude).IsRequired();
        builder.Property(p => p.Longitude).IsRequired();
        builder.Property(p => p.Timestamp).IsRequired();
        builder.HasIndex(p => new { p.ViagemId, p.Timestamp });
        builder.HasOne<Viagem>().WithMany().HasForeignKey(p => p.ViagemId).OnDelete(DeleteBehavior.Cascade);
    }
}
