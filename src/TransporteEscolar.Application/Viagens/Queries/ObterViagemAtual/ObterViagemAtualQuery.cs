using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Entities;

namespace TransporteEscolar.Application.Viagens.Queries.ObterViagemAtual;

public record ViagemDto(
    Guid Id,
    string Turno,
    DateOnly Data,
    string Status,
    double? LatitudeAtual,
    double? LongitudeAtual,
    DateTime? IniciadaEm,
    DateTime? ConcluidaEm,
    Guid? RotaId);

public record ObterViagemAtualQuery : IRequest<Result<ViagemDto?>>;
