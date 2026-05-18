using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TransporteEscolar.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class RemoveTransporteIdFromCheckIn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_CheckIns_TransporteId_HoraRegistro",
                table: "CheckIns");

            migrationBuilder.DropColumn(
                name: "TransporteId",
                table: "CheckIns");

            migrationBuilder.CreateIndex(
                name: "IX_CheckIns_TransportadorId_HoraRegistro",
                table: "CheckIns",
                columns: new[] { "TransportadorId", "HoraRegistro" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_CheckIns_TransportadorId_HoraRegistro",
                table: "CheckIns");

            migrationBuilder.AddColumn<Guid>(
                name: "TransporteId",
                table: "CheckIns",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_CheckIns_TransporteId_HoraRegistro",
                table: "CheckIns",
                columns: new[] { "TransporteId", "HoraRegistro" });
        }
    }
}
