using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TransporteEscolar.Domain.Entities;

namespace TransporteEscolar.Infrastructure.Persistence.Configurations;

public class EscolaConfiguration : IEntityTypeConfiguration<Escola>
{
    public void Configure(EntityTypeBuilder<Escola> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Nome).IsRequired().HasMaxLength(300);
        builder.Property(e => e.Telefone).HasMaxLength(20);
        builder.OwnsOne(e => e.Endereco, end =>
        {
            end.Property(e => e.Logradouro).HasColumnName("Logradouro").HasMaxLength(200);
            end.Property(e => e.Numero).HasColumnName("NumeroEndereco").HasMaxLength(10);
            end.Property(e => e.Bairro).HasColumnName("Bairro").HasMaxLength(100);
            end.Property(e => e.Cidade).HasColumnName("Cidade").HasMaxLength(100);
            end.Property(e => e.Estado).HasColumnName("Estado").HasMaxLength(2);
            end.Property(e => e.CEP).HasColumnName("CEP").HasMaxLength(9);
        });
    }
}
