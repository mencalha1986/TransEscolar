using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TransporteEscolar.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class FixSuperAdminPasswordHash : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Correct BCrypt hash of Admin@123 (workfactor 11, verified)
            migrationBuilder.Sql("""
                UPDATE "Usuarios"
                SET "PasswordHash" = '$2a$11$K0V73kylLdlOs11pJVzyOepnDYKD29nKU82g0r2.ESgHBJVSts5iW',
                    "AtualizadoEm" = now()
                WHERE "Email" = 'mencalha1986@gmail.com'
                  AND "Perfil" = 'SuperAdmin';
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
