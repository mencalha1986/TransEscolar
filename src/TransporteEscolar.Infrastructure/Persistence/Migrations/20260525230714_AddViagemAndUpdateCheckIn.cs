using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TransporteEscolar.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddViagemAndUpdateCheckIn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Endereco",
                table: "CheckIns",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ViagemId",
                table: "CheckIns",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Viagens",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TransportadorId = table.Column<Guid>(type: "uuid", nullable: false),
                    Turno = table.Column<int>(type: "integer", nullable: false),
                    Data = table.Column<DateOnly>(type: "date", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    LatitudeAtual = table.Column<double>(type: "double precision", nullable: true),
                    LongitudeAtual = table.Column<double>(type: "double precision", nullable: true),
                    IniciadaEm = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ConcluidaEm = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CriadoEm = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Viagens", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CheckIns_ViagemId",
                table: "CheckIns",
                column: "ViagemId");

            migrationBuilder.CreateIndex(
                name: "IX_Viagens_TransportadorId_Data_Turno",
                table: "Viagens",
                columns: new[] { "TransportadorId", "Data", "Turno" });

            migrationBuilder.CreateIndex(
                name: "IX_Viagens_TransportadorId_Status",
                table: "Viagens",
                columns: new[] { "TransportadorId", "Status" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Viagens");

            migrationBuilder.DropIndex(
                name: "IX_CheckIns_ViagemId",
                table: "CheckIns");

            migrationBuilder.DropColumn(
                name: "Endereco",
                table: "CheckIns");

            migrationBuilder.DropColumn(
                name: "ViagemId",
                table: "CheckIns");
        }
    }
}
