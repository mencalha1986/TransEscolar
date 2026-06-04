using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TransporteEscolar.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddPixToAssinatura : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PixBrCode",
                table: "Assinaturas",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PixBrCodeBase64",
                table: "Assinaturas",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PixCobrancaId",
                table: "Assinaturas",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "PixExpiresAt",
                table: "Assinaturas",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PixBrCode",
                table: "Assinaturas");

            migrationBuilder.DropColumn(
                name: "PixBrCodeBase64",
                table: "Assinaturas");

            migrationBuilder.DropColumn(
                name: "PixCobrancaId",
                table: "Assinaturas");

            migrationBuilder.DropColumn(
                name: "PixExpiresAt",
                table: "Assinaturas");
        }
    }
}
