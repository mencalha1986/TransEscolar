using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TransporteEscolar.Domain.Entities;

namespace TransporteEscolar.Infrastructure.Persistence.Configurations;

public class RotaConfiguration : IEntityTypeConfiguration<Rota>
{
    public void Configure(EntityTypeBuilder<Rota> builder)
    {
        builder.HasKey(r => r.Id);
        builder.Property(r => r.Nome).IsRequired().HasMaxLength(200);
        builder.Property(r => r.Turno).IsRequired().HasConversion<string>();

        builder.PrimitiveCollection<List<Guid>>("_alunoIds")
            .HasField("_alunoIds")
            .UsePropertyAccessMode(PropertyAccessMode.Field)
            .HasColumnName("AlunoIds");
    }
}
