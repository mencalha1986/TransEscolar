using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TransporteEscolar.Domain.Entities;

namespace TransporteEscolar.Infrastructure.Persistence.Configurations;

public class TransportadorConfiguration : IEntityTypeConfiguration<Transportador>
{
    public void Configure(EntityTypeBuilder<Transportador> builder)
    {
        builder.HasKey(t => t.Id);
        builder.Property(t => t.NomeEmpresa).IsRequired().HasMaxLength(200);
        builder.Property(t => t.NomeContato).IsRequired().HasMaxLength(200);
        builder.Property(t => t.CpfCnpj).IsRequired().HasMaxLength(20);
        builder.Property(t => t.Email).IsRequired().HasMaxLength(200);
        builder.Property(t => t.Telefone).HasMaxLength(20);
        builder.Property(t => t.Status).IsRequired().HasConversion<string>();
        builder.HasIndex(t => t.Email).IsUnique();
        builder.HasIndex(t => t.CpfCnpj).IsUnique();
    }
}
