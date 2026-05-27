using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TransporteEscolar.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class LimparDados : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                DELETE FROM "ViagemPercursos";
                DELETE FROM "CheckIns";
                DELETE FROM "EmailLogs";
                DELETE FROM "Viagens";
                DELETE FROM "PagamentosAssinatura";
                DELETE FROM "Mensalidades";
                DELETE FROM "Assinaturas";
                DELETE FROM "Recados";
                DELETE FROM "Alunos";
                DELETE FROM "Responsaveis";
                DELETE FROM "Transportes";
                DELETE FROM "Escolas";
                DELETE FROM "Usuarios" WHERE "Perfil" != 'SuperAdmin';
                DELETE FROM "Transportadores";
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
