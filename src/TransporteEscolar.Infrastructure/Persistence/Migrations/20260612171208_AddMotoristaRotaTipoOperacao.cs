using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TransporteEscolar.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddMotoristaRotaTipoOperacao : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                ALTER TABLE ""Transportadores""
                ADD COLUMN IF NOT EXISTS ""TipoOperacao"" text NOT NULL DEFAULT 'Autonomo';

                CREATE TABLE IF NOT EXISTS ""Motoristas"" (
                    ""Id"" uuid NOT NULL,
                    ""Nome"" character varying(200) NOT NULL,
                    ""Cpf"" character varying(20) NOT NULL,
                    ""Cnh"" character varying(20),
                    ""Telefone"" character varying(20),
                    ""TransportadorId"" uuid NOT NULL,
                    ""UsuarioId"" uuid,
                    ""Ativo"" boolean NOT NULL DEFAULT true,
                    ""CriadoEm"" timestamp with time zone NOT NULL,
                    ""AtualizadoEm"" timestamp with time zone NOT NULL,
                    CONSTRAINT ""PK_Motoristas"" PRIMARY KEY (""Id"")
                );

                CREATE UNIQUE INDEX IF NOT EXISTS ""IX_Motoristas_Cpf_TransportadorId""
                ON ""Motoristas"" (""Cpf"", ""TransportadorId"");

                CREATE TABLE IF NOT EXISTS ""Rotas"" (
                    ""Id"" uuid NOT NULL,
                    ""Nome"" character varying(200) NOT NULL,
                    ""Turno"" text NOT NULL,
                    ""TransportadorId"" uuid NOT NULL,
                    ""MotoristaId"" uuid,
                    ""TransporteId"" uuid,
                    ""AlunoIds"" uuid[] NOT NULL DEFAULT '{}',
                    ""CriadoEm"" timestamp with time zone NOT NULL,
                    ""AtualizadoEm"" timestamp with time zone NOT NULL,
                    CONSTRAINT ""PK_Rotas"" PRIMARY KEY (""Id"")
                );
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Motoristas");

            migrationBuilder.DropTable(
                name: "Rotas");

            migrationBuilder.DropColumn(
                name: "TipoOperacao",
                table: "Transportadores");
        }
    }
}
