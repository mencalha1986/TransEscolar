using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TransporteEscolar.Domain.Entities;

namespace TransporteEscolar.Infrastructure.Persistence.Configurations;

public class ResponsavelConfiguration : IEntityTypeConfiguration<Responsavel>
{
    public void Configure(EntityTypeBuilder<Responsavel> builder)
    {
        builder.HasKey(r => r.Id);
        builder.Property(r => r.Nome).IsRequired().HasMaxLength(200);
        builder.Property(r => r.Telefone).HasMaxLength(20);
        builder.Property(r => r.Email).IsRequired().HasMaxLength(200);
        builder.OwnsOne(r => r.CPF, cpf =>
        {
            cpf.Property(c => c.Numero).HasColumnName("CPF").IsRequired().HasMaxLength(11);
            cpf.HasIndex(c => c.Numero).IsUnique();
        });
        builder.OwnsOne(r => r.Endereco, end =>
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
