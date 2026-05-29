using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TransporteEscolar.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddDispositivoToken : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DispositivoTokens",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UsuarioId = table.Column<Guid>(type: "uuid", nullable: false),
                    Token = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: false),
                    Plataforma = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    TransportadorId = table.Column<Guid>(type: "uuid", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DispositivoTokens", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DispositivoTokens_Token",
                table: "DispositivoTokens",
                column: "Token");

            migrationBuilder.CreateIndex(
                name: "IX_DispositivoTokens_UsuarioId",
                table: "DispositivoTokens",
                column: "UsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_DispositivoTokens_UsuarioId_Plataforma",
                table: "DispositivoTokens",
                columns: new[] { "UsuarioId", "Plataforma" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DispositivoTokens");
        }
    }
}
