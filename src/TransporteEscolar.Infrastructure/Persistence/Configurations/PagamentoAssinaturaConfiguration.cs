using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TransporteEscolar.Domain.Entities;

namespace TransporteEscolar.Infrastructure.Persistence.Configurations;

public class PagamentoAssinaturaConfiguration : IEntityTypeConfiguration<PagamentoAssinatura>
{
    public void Configure(EntityTypeBuilder<PagamentoAssinatura> builder)
    {
        builder.HasKey(p => p.Id);
        builder.Property(p => p.AssinaturaId).IsRequired();
        builder.Property(p => p.DataPagamento).IsRequired();
        builder.Property(p => p.CompetenciaMes).IsRequired();
        builder.Property(p => p.CompetenciaAno).IsRequired();
        builder.Property(p => p.ValorPago).IsRequired().HasColumnType("numeric(10,2)");
        builder.Property(p => p.Observacao).HasMaxLength(500);
        builder.HasIndex(p => p.AssinaturaId);
    }
}
