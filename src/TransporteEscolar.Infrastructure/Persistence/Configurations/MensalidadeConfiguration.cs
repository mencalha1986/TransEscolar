using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TransporteEscolar.Domain.Entities;

namespace TransporteEscolar.Infrastructure.Persistence.Configurations;

public class MensalidadeConfiguration : IEntityTypeConfiguration<Mensalidade>
{
    public void Configure(EntityTypeBuilder<Mensalidade> builder)
    {
        builder.HasKey(m => m.Id);
        builder.Property(m => m.AlunoId).IsRequired();
        builder.Property(m => m.Competencia).IsRequired();
        builder.Property(m => m.DataVencimento).IsRequired();
        builder.Property(m => m.Valor).IsRequired().HasColumnType("numeric(10,2)");
        builder.Property(m => m.Status).IsRequired().HasConversion<string>();
        builder.Property(m => m.DataPagamento);

        builder.Property(m => m.PixCobrancaId).HasMaxLength(100);
        builder.Property(m => m.PixBrCode);
        builder.Property(m => m.PixBrCodeBase64);
        builder.Property(m => m.PixExpiresAt);

        builder.HasIndex(m => new { m.AlunoId, m.Competencia }).IsUnique();
    }
}
