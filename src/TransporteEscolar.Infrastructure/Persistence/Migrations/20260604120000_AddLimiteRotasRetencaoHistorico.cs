using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TransporteEscolar.Infrastructure.Persistence.Migrations
{
    [Microsoft.EntityFrameworkCore.Infrastructure.DbContext(typeof(TransporteEscolar.Infrastructure.Persistence.AppDbContext))]
    [Microsoft.EntityFrameworkCore.Migrations.Migration("20260604120000_AddLimiteRotasRetencaoHistorico")]
    public partial class AddLimiteRotasRetencaoHistorico : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "LimiteRotas",
                table: "Planos",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RetencaoHistoricoDias",
                table: "Planos",
                type: "integer",
                nullable: true);

            migrationBuilder.InsertData(
                table: "Planos",
                columns: new[] { "Id", "Ativo", "AtualizadoEm", "CriadoEm", "Descricao", "LimiteAlunos", "LimiteRotas", "Nome", "PrecoMensal", "RetencaoHistoricoDias" },
                columnTypes: new[] { "uuid", "boolean", "timestamp with time zone", "timestamp with time zone", "character varying(500)", "integer", "integer", "character varying(100)", "numeric(10,2)", "integer" },
                values: new object[,]
                {
                    {
                        new Guid("00000000-0000-0000-0000-000000000001"),
                        true,
                        new DateTime(2026, 6, 4, 0, 0, 0, DateTimeKind.Utc),
                        new DateTime(2026, 6, 4, 0, 0, 0, DateTimeKind.Utc),
                        "Ideal para quem está começando",
                        30,
                        1,
                        "Básico",
                        59.00m,
                        30
                    },
                    {
                        new Guid("00000000-0000-0000-0000-000000000002"),
                        true,
                        new DateTime(2026, 6, 4, 0, 0, 0, DateTimeKind.Utc),
                        new DateTime(2026, 6, 4, 0, 0, 0, DateTimeKind.Utc),
                        "O mais escolhido pelos transportadores",
                        100,
                        5,
                        "Profissional",
                        129.00m,
                        180
                    },
                    {
                        new Guid("00000000-0000-0000-0000-000000000003"),
                        true,
                        new DateTime(2026, 6, 4, 0, 0, 0, DateTimeKind.Utc),
                        new DateTime(2026, 6, 4, 0, 0, 0, DateTimeKind.Utc),
                        "Para frotas e empresas de transporte",
                        null,
                        null,
                        "Empresarial",
                        249.00m,
                        null
                    }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Planos",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.DeleteData(
                table: "Planos",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000002"));

            migrationBuilder.DeleteData(
                table: "Planos",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000003"));

            migrationBuilder.DropColumn(
                name: "LimiteRotas",
                table: "Planos");

            migrationBuilder.DropColumn(
                name: "RetencaoHistoricoDias",
                table: "Planos");
        }
    }
}
