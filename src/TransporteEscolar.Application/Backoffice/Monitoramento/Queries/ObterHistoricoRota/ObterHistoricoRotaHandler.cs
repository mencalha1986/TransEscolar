using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Backoffice.Monitoramento.Queries.ObterHistoricoRota;

public class ObterHistoricoRotaHandler : IRequestHandler<ObterHistoricoRotaQuery, Result<HistoricoRotaDto>>
{
    private readonly IViagemRepository _viagemRepo;
    private readonly ITransporteRepository _transporteRepo;
    private readonly IAlunoRepository _alunoRepo;
    private readonly ITransportadorRepository _transportadorRepo;

    public ObterHistoricoRotaHandler(
        IViagemRepository viagemRepo,
        ITransporteRepository transporteRepo,
        IAlunoRepository alunoRepo,
        ITransportadorRepository transportadorRepo)
        => (_viagemRepo, _transporteRepo, _alunoRepo, _transportadorRepo)
            = (viagemRepo, transporteRepo, alunoRepo, transportadorRepo);

    public async Task<Result<HistoricoRotaDto>> Handle(ObterHistoricoRotaQuery request, CancellationToken ct)
    {
        var viagens = (await _viagemRepo.ListarPorDataAsync(request.Data, request.TransportadorId, ct)).ToList();

        var transportadores = (await _transportadorRepo.ListarTodosAsync(ct)).ToDictionary(t => t.Id, t => t.NomeEmpresa);
        var nomeTransportador = transportadores.TryGetValue(request.TransportadorId, out var n) ? n : request.TransportadorId.ToString();

        var checkIns = (await _transporteRepo.ListarCheckInsAsync(request.Data, ct)).ToList();
        var alunos = (await _alunoRepo.ListarTodosAsync(ct)).ToDictionary(a => a.Id, a => a.Nome);

        var viagensDtos = viagens.Select(v =>
        {
            var checkInsViagem = checkIns
                .Where(c => c.ViagemId == v.Id)
                .OrderBy(c => c.HoraRegistro)
                .Select(c =>
                {
                    var nomeAluno = alunos.TryGetValue(c.AlunoId, out var nome) ? nome : c.AlunoId.ToString();
                    return new CheckInHistoricoDto(nomeAluno, c.Tipo.ToString(), c.HoraRegistro, c.Latitude, c.Longitude, c.Endereco);
                });

            return new ViagemHistoricoDto(v.Id, v.Turno.ToString(), v.Status.ToString(), v.IniciadaEm, v.ConcluidaEm, checkInsViagem);
        });

        return Result<HistoricoRotaDto>.Success(new HistoricoRotaDto(request.TransportadorId, nomeTransportador, viagensDtos));
    }
}
