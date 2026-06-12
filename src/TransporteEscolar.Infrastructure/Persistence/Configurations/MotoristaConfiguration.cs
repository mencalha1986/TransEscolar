using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TransporteEscolar.Domain.Entities;

namespace TransporteEscolar.Infrastructure.Persistence.Configurations;

public class MotoristaConfiguration : IEntityTypeConfiguration<Motorista>
{
    public void Configure(EntityTypeBuilder<Motorista> builder)
    {
        builder.HasKey(m => m.Id);
        builder.Property(m => m.Nome).IsRequired().HasMaxLength(200);
        builder.Property(m => m.Cpf).IsRequired().HasMaxLength(20);
        builder.Property(m => m.Cnh).HasMaxLength(20);
        builder.Property(m => m.Telefone).HasMaxLength(20);
        builder.Property(m => m.Ativo).IsRequired().HasDefaultValue(true);
        builder.HasIndex(m => new { m.Cpf, m.TransportadorId }).IsUnique();
    }
}
