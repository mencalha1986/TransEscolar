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

        builder.HasIndex(m => new { m.AlunoId, m.Competencia }).IsUnique();
    }
}
