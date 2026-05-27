using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TransporteEscolar.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AdicionarFaltas : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Faltas",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    AlunoId = table.Column<Guid>(type: "uuid", nullable: false),
                    AlunoNome = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ResponsavelId = table.Column<Guid>(type: "uuid", nullable: false),
                    Data = table.Column<DateOnly>(type: "date", nullable: false),
                    Motivo = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    TransportadorId = table.Column<Guid>(type: "uuid", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Faltas", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Faltas_AlunoId_Data",
                table: "Faltas",
                columns: new[] { "AlunoId", "Data" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Faltas_TransportadorId_Data",
                table: "Faltas",
                columns: new[] { "TransportadorId", "Data" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Faltas");
        }
    }
}
