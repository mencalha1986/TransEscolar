using MediatR;
using TransporteEscolar.Application.Common;

namespace TransporteEscolar.Application.Backoffice.Planos.Commands.CriarPlano;

public record CriarPlanoCommand(string Nome, decimal PrecoMensal, int? LimiteAlunos, string? Descricao, int? LimiteRotas = null, int? RetencaoHistoricoDias = null)
    : IRequest<Result<Guid>>;
