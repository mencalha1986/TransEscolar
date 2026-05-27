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

        builder.OwnsOne(a => a.Endereco, end =>
        {
            end.Property(e => e.Logradouro).HasColumnName("Logradouro").HasMaxLength(200).IsRequired(false);
            end.Property(e => e.Numero).HasColumnName("NumeroEndereco").HasMaxLength(10).IsRequired(false);
            end.Property(e => e.Bairro).HasColumnName("Bairro").HasMaxLength(100).IsRequired(false);
            end.Property(e => e.Cidade).HasColumnName("Cidade").HasMaxLength(100).IsRequired(false);
            end.Property(e => e.Estado).HasColumnName("Estado").HasMaxLength(2).IsRequired(false);
            end.Property(e => e.CEP).HasColumnName("CEP").HasMaxLength(9).IsRequired(false);
        });
    }
}
