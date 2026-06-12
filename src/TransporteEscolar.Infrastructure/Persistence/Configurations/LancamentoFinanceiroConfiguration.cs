using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TransporteEscolar.Domain.Entities;

namespace TransporteEscolar.Infrastructure.Persistence.Configurations;

public class LancamentoFinanceiroConfiguration : IEntityTypeConfiguration<LancamentoFinanceiro>
{
    public void Configure(EntityTypeBuilder<LancamentoFinanceiro> builder)
    {
        builder.HasKey(l => l.Id);
        builder.Property(l => l.TransportadorId).IsRequired();
        builder.Property(l => l.Tipo).IsRequired().HasConversion<int>();
        builder.Property(l => l.Descricao).IsRequired().HasMaxLength(300);
        builder.Property(l => l.Valor).IsRequired().HasColumnType("numeric(10,2)");
        builder.Property(l => l.DataLancamento).IsRequired();
        builder.Property(l => l.Observacao).HasMaxLength(500);

        builder.HasOne<Transporte>()
               .WithMany()
               .HasForeignKey(l => l.TransporteId)
               .IsRequired(false)
               .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(l => new { l.TransportadorId, l.DataLancamento });
    }
}
