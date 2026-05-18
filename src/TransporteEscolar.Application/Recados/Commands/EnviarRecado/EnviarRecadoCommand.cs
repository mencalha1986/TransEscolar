using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Entities;

namespace TransporteEscolar.Application.Recados.Commands.EnviarRecado;

public record EnviarRecadoCommand(
    string Conteudo,
    TipoRecado Tipo,
    Guid? DestinatarioUsuarioId = null,
    TurnoAluno? TurnoFiltro = null,
    Guid? EscolaFiltroId = null) : IRequest<Result<Guid>>;
