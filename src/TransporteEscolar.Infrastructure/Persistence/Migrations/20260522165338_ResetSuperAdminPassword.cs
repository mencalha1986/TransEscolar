using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TransporteEscolar.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class ResetSuperAdminPassword : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Reset SuperAdmin password to Admin@123
            // Hash generated with BCrypt workfactor 11
            migrationBuilder.Sql("""
                UPDATE "Usuarios"
                SET "PasswordHash" = '$2a$11$xnGTtZu0hkWSNHB3Kx0ln.4l8Sh.pNc0B5xs8JMROOw56cRWbIft6',
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
