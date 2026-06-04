using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TransporteEscolar.Domain.Entities;

namespace TransporteEscolar.Infrastructure.Persistence.Configurations;

public class PlanoConfiguration : IEntityTypeConfiguration<Plano>
{
    public void Configure(EntityTypeBuilder<Plano> builder)
    {
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Nome).IsRequired().HasMaxLength(100);
        builder.Property(p => p.Descricao).HasMaxLength(500);
        builder.Property(p => p.PrecoMensal).IsRequired().HasColumnType("numeric(10,2)");
        builder.Property(p => p.LimiteAlunos);
        builder.Property(p => p.LimiteRotas);
        builder.Property(p => p.RetencaoHistoricoDias);
        builder.Property(p => p.Ativo).IsRequired();
    }
}
