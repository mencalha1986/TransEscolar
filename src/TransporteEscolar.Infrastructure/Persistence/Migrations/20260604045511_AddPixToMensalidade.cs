using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TransporteEscolar.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddPixToMensalidade : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PixBrCode",
                table: "Mensalidades",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PixBrCodeBase64",
                table: "Mensalidades",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PixCobrancaId",
                table: "Mensalidades",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "PixExpiresAt",
                table: "Mensalidades",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PixBrCode",
                table: "Mensalidades");

            migrationBuilder.DropColumn(
                name: "PixBrCodeBase64",
                table: "Mensalidades");

            migrationBuilder.DropColumn(
                name: "PixCobrancaId",
                table: "Mensalidades");

            migrationBuilder.DropColumn(
                name: "PixExpiresAt",
                table: "Mensalidades");
        }
    }
}
