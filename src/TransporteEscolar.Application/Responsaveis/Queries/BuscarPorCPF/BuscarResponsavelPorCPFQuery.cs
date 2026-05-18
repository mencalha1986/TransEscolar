using MediatR;
using TransporteEscolar.Application.Common;

namespace TransporteEscolar.Application.Responsaveis.Queries.BuscarPorCPF;

public record ResponsavelResumoDto(string Nome, string Telefone, string Email);

public record BuscarResponsavelPorCPFQuery(string CPF) : IRequest<Result<ResponsavelResumoDto>>;
