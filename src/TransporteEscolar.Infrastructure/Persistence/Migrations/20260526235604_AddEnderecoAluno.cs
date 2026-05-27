using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TransporteEscolar.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddEnderecoAluno : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Bairro",
                table: "Alunos",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CEP",
                table: "Alunos",
                type: "character varying(9)",
                maxLength: 9,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Cidade",
                table: "Alunos",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Estado",
                table: "Alunos",
                type: "character varying(2)",
                maxLength: 2,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Logradouro",
                table: "Alunos",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NumeroEndereco",
                table: "Alunos",
                type: "character varying(10)",
                maxLength: 10,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Bairro",
                table: "Alunos");

            migrationBuilder.DropColumn(
                name: "CEP",
                table: "Alunos");

            migrationBuilder.DropColumn(
                name: "Cidade",
                table: "Alunos");

            migrationBuilder.DropColumn(
                name: "Estado",
                table: "Alunos");

            migrationBuilder.DropColumn(
                name: "Logradouro",
                table: "Alunos");

            migrationBuilder.DropColumn(
                name: "NumeroEndereco",
                table: "Alunos");
        }
    }
}
