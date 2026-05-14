using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TransporteEscolar.Domain.Entities;

namespace TransporteEscolar.Infrastructure.Persistence.Configurations;

public class TransporteConfiguration : IEntityTypeConfiguration<Transporte>
{
    public void Configure(EntityTypeBuilder<Transporte> builder)
    {
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Placa).IsRequired().HasMaxLength(10);
        builder.Property(t => t.NomeMotorista).IsRequired().HasMaxLength(200);
        builder.Property(t => t.CapacidadeMaxima).IsRequired();
        builder.Property(t => t.Status).IsRequired();

        builder.PrimitiveCollection<List<Guid>>("_alunoIds")
            .HasField("_alunoIds")
            .UsePropertyAccessMode(PropertyAccessMode.Field)
            .HasColumnName("AlunoIds");
    }
}
