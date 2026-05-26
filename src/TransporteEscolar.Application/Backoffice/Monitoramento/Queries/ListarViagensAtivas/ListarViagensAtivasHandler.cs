using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Entities;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Backoffice.Monitoramento.Queries.ListarViagensAtivas;

public class ListarViagensAtivasHandler : IRequestHandler<ListarViagensAtivasQuery, Result<IEnumerable<ViagemAtivaDto>>>
{
    private readonly IViagemRepository _viagemRepo;
    private readonly ITransporteRepository _transporteRepo;
    private readonly ITransportadorRepository _transportadorRepo;

    public ListarViagensAtivasHandler(
        IViagemRepository viagemRepo,
        ITransporteRepository transporteRepo,
        ITransportadorRepository transportadorRepo)
        => (_viagemRepo, _transporteRepo, _transportadorRepo) = (viagemRepo, transporteRepo, transportadorRepo);

    public async Task<Result<IEnumerable<ViagemAtivaDto>>> Handle(ListarViagensAtivasQuery request, CancellationToken ct)
    {
        var viagens = (await _viagemRepo.ListarAtivasHojeAsync(ct)).ToList();
        if (viagens.Count == 0)
            return Result<IEnumerable<ViagemAtivaDto>>.Success(Enumerable.Empty<ViagemAtivaDto>());

        var hoje = DateOnly.FromDateTime(DateTime.UtcNow);
        var checkIns = (await _transporteRepo.ListarCheckInsAsync(hoje, ct)).ToList();
        var transportadores = (await _transportadorRepo.ListarTodosAsync(ct)).ToDictionary(t => t.Id, t => t.NomeEmpresa);

        var dtos = viagens.Select(v =>
        {
            var checkInsViagem = checkIns.Where(c => c.ViagemId == v.Id).ToList();
            var embarcados = checkInsViagem.Count(c => c.Tipo == TipoCheckIn.Embarque);
            var desembarcados = checkInsViagem.Count(c => c.Tipo == TipoCheckIn.Desembarque);
            var nome = transportadores.TryGetValue(v.TransportadorId, out var n) ? n : v.TransportadorId.ToString();
            return new ViagemAtivaDto(v.Id, v.TransportadorId, nome, v.Turno.ToString(),
                v.LatitudeAtual, v.LongitudeAtual, v.IniciadaEm, embarcados, desembarcados);
        });

        return Result<IEnumerable<ViagemAtivaDto>>.Success(dtos);
    }
}
