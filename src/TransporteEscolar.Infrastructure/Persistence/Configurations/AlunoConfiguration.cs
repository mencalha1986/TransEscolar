using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TransporteEscolar.Domain.Entities;

namespace TransporteEscolar.Infrastructure.Persistence.Configurations;

public class AlunoConfiguration : IEntityTypeConfiguration<Aluno>
{
    public void Configure(EntityTypeBuilder<Aluno> builder)
    {
        builder.HasKey(a => a.Id);
        builder.Property(a => a.Nome).IsRequired().HasMaxLength(200);
        builder.Property(a => a.DataNascimento).IsRequired();
        builder.Property(a => a.EscolaId).IsRequired();
        builder.Property(a => a.Foto).HasColumnType("bytea");
        builder.Property(a => a.ValorMensalidade).IsRequired().HasColumnType("numeric(10,2)");
        builder.Property(a => a.DiaVencimento).IsRequired();
        builder.Property(a => a.Turno).IsRequired().HasConversion<string>();

        builder.PrimitiveCollection<List<Guid>>("_responsavelIds")
            .HasField("_responsavelIds")
            .UsePropertyAccessMode(PropertyAccessMode.Field)
            .HasColumnName("ResponsavelIds");
    }
}
