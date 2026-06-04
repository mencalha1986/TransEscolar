using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TransporteEscolar.Infrastructure.Persistence.Migrations
{
    [Microsoft.EntityFrameworkCore.Infrastructure.DbContext(typeof(TransporteEscolar.Infrastructure.Persistence.AppDbContext))]
    [Microsoft.EntityFrameworkCore.Migrations.Migration("20260604130000_AddVitalicioToTransportador")]
    public partial class AddVitalicioToTransportador : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Vitalicio",
                table: "Transportadores",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Vitalicio",
                table: "Transportadores");
        }
    }
}
