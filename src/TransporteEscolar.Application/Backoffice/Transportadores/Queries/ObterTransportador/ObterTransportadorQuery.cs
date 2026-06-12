using MediatR;
using TransporteEscolar.Domain.Entities;

namespace TransporteEscolar.Application.Backoffice.Transportadores.Queries.ObterTransportador;

public record TransportadorDetalheDto(
    Guid Id,
    string NomeEmpresa,
    string NomeContato,
    string CpfCnpj,
    string Email,
    string? Telefone,
    StatusTransportador Status,
    int TotalAlunos,
    DateTime CriadoEm,
    bool Vitalicio,
    string? NomePlano,
    TipoOperacao TipoOperacao
);

public record ObterTransportadorQuery(Guid Id) : IRequest<TransportadorDetalheDto?>;
