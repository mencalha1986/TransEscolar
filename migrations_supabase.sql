CREATE TABLE IF NOT EXISTS "__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL,
    CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
);

START TRANSACTION;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260514234324_InitialCreate') THEN
    CREATE TABLE "Alunos" (
        "Id" uuid NOT NULL,
        "Nome" character varying(200) NOT NULL,
        "DataNascimento" timestamp with time zone NOT NULL,
        "EscolaId" uuid NOT NULL,
        "Foto" bytea,
        "ResponsavelIds" uuid[] NOT NULL,
        "CriadoEm" timestamp with time zone NOT NULL,
        "AtualizadoEm" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_Alunos" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260514234324_InitialCreate') THEN
    CREATE TABLE "CheckIns" (
        "Id" uuid NOT NULL,
        "AlunoId" uuid NOT NULL,
        "TransporteId" uuid NOT NULL,
        "Tipo" integer NOT NULL,
        "HoraRegistro" timestamp with time zone NOT NULL,
        "Latitude" double precision,
        "Longitude" double precision,
        "CriadoEm" timestamp with time zone NOT NULL,
        "AtualizadoEm" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_CheckIns" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260514234324_InitialCreate') THEN
    CREATE TABLE "Escolas" (
        "Id" uuid NOT NULL,
        "Nome" character varying(300) NOT NULL,
        "Logradouro" character varying(200) NOT NULL,
        "NumeroEndereco" character varying(10) NOT NULL,
        "Bairro" character varying(100) NOT NULL,
        "Cidade" character varying(100) NOT NULL,
        "Estado" character varying(2) NOT NULL,
        "CEP" character varying(9) NOT NULL,
        "Telefone" character varying(20) NOT NULL,
        "CriadoEm" timestamp with time zone NOT NULL,
        "AtualizadoEm" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_Escolas" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260514234324_InitialCreate') THEN
    CREATE TABLE "Responsaveis" (
        "Id" uuid NOT NULL,
        "Nome" character varying(200) NOT NULL,
        "CPF" character varying(11) NOT NULL,
        "Telefone" character varying(20) NOT NULL,
        "Email" character varying(200) NOT NULL,
        "Logradouro" character varying(200) NOT NULL,
        "NumeroEndereco" character varying(10) NOT NULL,
        "Bairro" character varying(100) NOT NULL,
        "Cidade" character varying(100) NOT NULL,
        "Estado" character varying(2) NOT NULL,
        "CEP" character varying(9) NOT NULL,
        "CriadoEm" timestamp with time zone NOT NULL,
        "AtualizadoEm" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_Responsaveis" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260514234324_InitialCreate') THEN
    CREATE TABLE "Transportes" (
        "Id" uuid NOT NULL,
        "Placa" character varying(10) NOT NULL,
        "NomeMotorista" character varying(200) NOT NULL,
        "CapacidadeMaxima" integer NOT NULL,
        "Status" integer NOT NULL,
        "AlunoIds" uuid[] NOT NULL,
        "CriadoEm" timestamp with time zone NOT NULL,
        "AtualizadoEm" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_Transportes" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260514234324_InitialCreate') THEN
    CREATE INDEX "IX_CheckIns_AlunoId" ON "CheckIns" ("AlunoId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260514234324_InitialCreate') THEN
    CREATE INDEX "IX_CheckIns_TransporteId_HoraRegistro" ON "CheckIns" ("TransporteId", "HoraRegistro");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260514234324_InitialCreate') THEN
    CREATE UNIQUE INDEX "IX_Responsaveis_CPF" ON "Responsaveis" ("CPF");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260514234324_InitialCreate') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260514234324_InitialCreate', '9.0.16');
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260515001746_AddUsuarios') THEN
    CREATE TABLE "Usuarios" (
        "Id" uuid NOT NULL,
        "Nome" character varying(200) NOT NULL,
        "Email" character varying(200) NOT NULL,
        "PasswordHash" text NOT NULL,
        "Perfil" integer NOT NULL,
        "CriadoEm" timestamp with time zone NOT NULL,
        "AtualizadoEm" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_Usuarios" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260515001746_AddUsuarios') THEN
    CREATE UNIQUE INDEX "IX_Usuarios_Email" ON "Usuarios" ("Email");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260515001746_AddUsuarios') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260515001746_AddUsuarios', '9.0.16');
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260515022718_AddMensalidadesECamposAluno') THEN
    ALTER TABLE "Alunos" ADD "DiaVencimento" integer NOT NULL DEFAULT 0;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260515022718_AddMensalidadesECamposAluno') THEN
    ALTER TABLE "Alunos" ADD "ValorMensalidade" numeric(10,2) NOT NULL DEFAULT 0.0;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260515022718_AddMensalidadesECamposAluno') THEN
    CREATE TABLE "Mensalidades" (
        "Id" uuid NOT NULL,
        "AlunoId" uuid NOT NULL,
        "Competencia" date NOT NULL,
        "DataVencimento" date NOT NULL,
        "Valor" numeric(10,2) NOT NULL,
        "Status" text NOT NULL,
        "DataPagamento" date,
        "CriadoEm" timestamp with time zone NOT NULL,
        "AtualizadoEm" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_Mensalidades" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260515022718_AddMensalidadesECamposAluno') THEN
    CREATE UNIQUE INDEX "IX_Mensalidades_AlunoId_Competencia" ON "Mensalidades" ("AlunoId", "Competencia");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260515022718_AddMensalidadesECamposAluno') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260515022718_AddMensalidadesECamposAluno', '9.0.16');
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260515025246_AddTurnoAlunoEMustChangePassword') THEN
    ALTER TABLE "Usuarios" ALTER COLUMN "Perfil" TYPE text;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260515025246_AddTurnoAlunoEMustChangePassword') THEN
    ALTER TABLE "Usuarios" ADD "MustChangePassword" boolean NOT NULL DEFAULT FALSE;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260515025246_AddTurnoAlunoEMustChangePassword') THEN
    ALTER TABLE "Alunos" ADD "Turno" text NOT NULL DEFAULT '';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260515025246_AddTurnoAlunoEMustChangePassword') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260515025246_AddTurnoAlunoEMustChangePassword', '9.0.16');
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260515223440_AddMultiTenantBackoffice') THEN
    ALTER TABLE "Usuarios" ADD "TransportadorId" uuid;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260515223440_AddMultiTenantBackoffice') THEN
    ALTER TABLE "Transportes" ADD "TransportadorId" uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260515223440_AddMultiTenantBackoffice') THEN
    ALTER TABLE "Responsaveis" ADD "TransportadorId" uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260515223440_AddMultiTenantBackoffice') THEN
    ALTER TABLE "Mensalidades" ADD "TransportadorId" uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260515223440_AddMultiTenantBackoffice') THEN
    ALTER TABLE "Escolas" ADD "TransportadorId" uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260515223440_AddMultiTenantBackoffice') THEN
    ALTER TABLE "CheckIns" ADD "TransportadorId" uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260515223440_AddMultiTenantBackoffice') THEN
    ALTER TABLE "Alunos" ADD "TransportadorId" uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260515223440_AddMultiTenantBackoffice') THEN
    CREATE TABLE "Assinaturas" (
        "Id" uuid NOT NULL,
        "TransportadorId" uuid NOT NULL,
        "PlanoId" uuid NOT NULL,
        "DataInicio" timestamp with time zone NOT NULL,
        "DataProximoVencimento" timestamp with time zone NOT NULL,
        "Status" text NOT NULL,
        "ValorContratado" numeric(10,2) NOT NULL,
        "CriadoEm" timestamp with time zone NOT NULL,
        "AtualizadoEm" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_Assinaturas" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260515223440_AddMultiTenantBackoffice') THEN
    CREATE TABLE "PagamentosAssinatura" (
        "Id" uuid NOT NULL,
        "AssinaturaId" uuid NOT NULL,
        "DataPagamento" timestamp with time zone NOT NULL,
        "CompetenciaMes" integer NOT NULL,
        "CompetenciaAno" integer NOT NULL,
        "ValorPago" numeric(10,2) NOT NULL,
        "Observacao" character varying(500),
        "CriadoEm" timestamp with time zone NOT NULL,
        "AtualizadoEm" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_PagamentosAssinatura" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260515223440_AddMultiTenantBackoffice') THEN
    CREATE TABLE "Planos" (
        "Id" uuid NOT NULL,
        "Nome" character varying(100) NOT NULL,
        "Descricao" character varying(500),
        "PrecoMensal" numeric(10,2) NOT NULL,
        "LimiteAlunos" integer,
        "Ativo" boolean NOT NULL,
        "CriadoEm" timestamp with time zone NOT NULL,
        "AtualizadoEm" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_Planos" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260515223440_AddMultiTenantBackoffice') THEN
    CREATE TABLE "Transportadores" (
        "Id" uuid NOT NULL,
        "NomeEmpresa" character varying(200) NOT NULL,
        "NomeContato" character varying(200) NOT NULL,
        "CpfCnpj" character varying(20) NOT NULL,
        "Email" character varying(200) NOT NULL,
        "Telefone" character varying(20),
        "Status" text NOT NULL,
        "PlanoId" uuid,
        "CriadoEm" timestamp with time zone NOT NULL,
        "AtualizadoEm" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_Transportadores" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260515223440_AddMultiTenantBackoffice') THEN
    CREATE INDEX "IX_Assinaturas_TransportadorId" ON "Assinaturas" ("TransportadorId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260515223440_AddMultiTenantBackoffice') THEN
    CREATE INDEX "IX_PagamentosAssinatura_AssinaturaId" ON "PagamentosAssinatura" ("AssinaturaId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260515223440_AddMultiTenantBackoffice') THEN
    CREATE UNIQUE INDEX "IX_Transportadores_CpfCnpj" ON "Transportadores" ("CpfCnpj");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260515223440_AddMultiTenantBackoffice') THEN
    CREATE UNIQUE INDEX "IX_Transportadores_Email" ON "Transportadores" ("Email");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260515223440_AddMultiTenantBackoffice') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260515223440_AddMultiTenantBackoffice', '9.0.16');
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260517025622_AddRecados') THEN
    CREATE TABLE "Recados" (
        "Id" uuid NOT NULL,
        "Conteudo" text NOT NULL,
        "Tipo" integer NOT NULL,
        "AutorId" uuid NOT NULL,
        "AutorNome" text NOT NULL,
        "DestinatarioUsuarioId" uuid,
        "TurnoFiltro" integer,
        "EscolaFiltroId" uuid,
        "TransportadorId" uuid NOT NULL,
        "CriadoEm" timestamp with time zone NOT NULL,
        "AtualizadoEm" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_Recados" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260517025622_AddRecados') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260517025622_AddRecados', '9.0.16');
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260517044418_RemoveTransporteIdFromCheckIn') THEN
    DROP INDEX "IX_CheckIns_TransporteId_HoraRegistro";
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260517044418_RemoveTransporteIdFromCheckIn') THEN
    ALTER TABLE "CheckIns" DROP COLUMN "TransporteId";
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260517044418_RemoveTransporteIdFromCheckIn') THEN
    CREATE INDEX "IX_CheckIns_TransportadorId_HoraRegistro" ON "CheckIns" ("TransportadorId", "HoraRegistro");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260517044418_RemoveTransporteIdFromCheckIn') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260517044418_RemoveTransporteIdFromCheckIn', '9.0.16');
    END IF;
END $EF$;
COMMIT;

