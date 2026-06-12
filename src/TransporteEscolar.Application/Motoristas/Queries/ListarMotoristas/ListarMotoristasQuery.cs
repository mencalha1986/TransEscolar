using MediatR;

namespace TransporteEscolar.Application.Motoristas.Queries.ListarMotoristas;

public record MotoristaDto(Guid Id, string Nome, string Cpf, string? Cnh, string? Telefone, bool Ativo, DateTime CriadoEm);

public record ListarMotoristasQuery : IRequest<IEnumerable<MotoristaDto>>;
