using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TransporteEscolar.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class RecriaSuperAdmin : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Força a recriação do SuperAdmin pelo Program.cs com hash gerado na hora
            migrationBuilder.Sql("""
                DELETE FROM "Usuarios" WHERE "Perfil" = 'SuperAdmin';
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
