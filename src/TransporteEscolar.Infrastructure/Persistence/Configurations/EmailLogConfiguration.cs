using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TransporteEscolar.Domain.Entities;

namespace TransporteEscolar.Infrastructure.Persistence.Configurations;

public class EmailLogConfiguration : IEntityTypeConfiguration<EmailLog>
{
    public void Configure(EntityTypeBuilder<EmailLog> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Destinatario).IsRequired().HasMaxLength(200);
        builder.Property(e => e.Nome).IsRequired().HasMaxLength(200);
        builder.Property(e => e.TransportadorId).IsRequired();
        builder.Property(e => e.Status).IsRequired().HasConversion<string>();
        builder.Property(e => e.ErroMensagem).HasMaxLength(2000);
    }
}
