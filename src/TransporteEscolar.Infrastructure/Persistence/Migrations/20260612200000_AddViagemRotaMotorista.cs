using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TransporteEscolar.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddViagemRotaMotorista : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                ALTER TABLE ""Viagens""
                ADD COLUMN IF NOT EXISTS ""RotaId"" uuid;

                ALTER TABLE ""Viagens""
                ADD COLUMN IF NOT EXISTS ""MotoristaId"" uuid;

                CREATE INDEX IF NOT EXISTS ""IX_Viagens_MotoristaId_Data_Status""
                ON ""Viagens"" (""MotoristaId"", ""Data"", ""Status"")
                WHERE ""MotoristaId"" IS NOT NULL;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                DROP INDEX IF EXISTS ""IX_Viagens_MotoristaId_Data_Status"";

                ALTER TABLE ""Viagens""
                DROP COLUMN IF EXISTS ""MotoristaId"";

                ALTER TABLE ""Viagens""
                DROP COLUMN IF EXISTS ""RotaId"";
            ");
        }
    }
}
