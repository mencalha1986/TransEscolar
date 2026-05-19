using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TransporteEscolar.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class SeedSuperAdmin : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                INSERT INTO "Usuarios" ("Id", "Nome", "Email", "PasswordHash", "Perfil", "MustChangePassword", "TransportadorId", "CriadoEm", "AtualizadoEm")
                SELECT gen_random_uuid(), 'Super Admin', 'mencalha1986@gmail.com',
                       '$2a$11$xnGTtZu0hkWSNHB3Kx0ln.4l8Sh.pNc0B5xs8JMROOw56cRWbIft6',
                       'SuperAdmin', false, NULL, now(), now()
                WHERE NOT EXISTS (SELECT 1 FROM "Usuarios" WHERE "Email" = 'mencalha1986@gmail.com');
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                DELETE FROM "Usuarios" WHERE "Email" = 'mencalha1986@gmail.com' AND "Perfil" = 'SuperAdmin';
                """);
        }
    }
}
