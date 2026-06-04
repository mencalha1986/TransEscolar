using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TransporteEscolar.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class RemovePlanoIdFromTransportador : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PlanoId",
                table: "Transportadores");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "PlanoId",
                table: "Transportadores",
                type: "uuid",
                nullable: true);
        }
    }
}
