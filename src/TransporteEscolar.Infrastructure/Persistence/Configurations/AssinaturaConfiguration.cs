using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TransporteEscolar.Domain.Entities;

namespace TransporteEscolar.Infrastructure.Persistence.Configurations;

public class AssinaturaConfiguration : IEntityTypeConfiguration<Assinatura>
{
    public void Configure(EntityTypeBuilder<Assinatura> builder)
    {
        builder.HasKey(a => a.Id);
        builder.Property(a => a.TransportadorId).IsRequired();
        builder.Property(a => a.PlanoId).IsRequired();
        builder.Property(a => a.DataInicio).IsRequired();
        builder.Property(a => a.DataProximoVencimento).IsRequired();
        builder.Property(a => a.Status).IsRequired().HasConversion<string>();
        builder.Property(a => a.ValorContratado).IsRequired().HasColumnType("numeric(10,2)");
        builder.Property(a => a.PixCobrancaId).HasMaxLength(100);
        builder.Property(a => a.PixBrCode);
        builder.Property(a => a.PixBrCodeBase64);
        builder.Property(a => a.PixExpiresAt);
        builder.HasIndex(a => a.TransportadorId);
    }
}
