using MediatR;
using TransporteEscolar.Application.Common;

namespace TransporteEscolar.Application.Viagens.Queries.ObterFrotaAtiva;

public record VeiculoAtivoDto(
    Guid ViagemId,
    Guid? MotoristaId,
    string MotoristaNome,
    Guid? RotaId,
    string RotaNome,
    string Turno,
    double? Latitude,
    double? Longitude,
    DateTime? UltimaAtualizacao,
    int TotalAlunos);

public record ObterFrotaAtivaQuery : IRequest<Result<IEnumerable<VeiculoAtivoDto>>>;
