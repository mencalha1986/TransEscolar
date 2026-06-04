using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Transporte.Queries.ListarCheckIns;

public class ListarCheckInsHandler : IRequestHandler<ListarCheckInsQuery, Result<IEnumerable<CheckInDto>>>
{
    private readonly ITransporteRepository _repo;
    private readonly IAlunoRepository _alunoRepo;
    private readonly ICurrentTenantService _tenant;
    private readonly IAssinaturaRepository _assinaturaRepo;
    private readonly IPlanoRepository _planoRepo;
    private readonly ITransportadorRepository _transportadorRepo;

    public ListarCheckInsHandler(
        ITransporteRepository repo,
        IAlunoRepository alunoRepo,
        ICurrentTenantService tenant,
        IAssinaturaRepository assinaturaRepo,
        IPlanoRepository planoRepo,
        ITransportadorRepository transportadorRepo)
    {
        (_repo, _alunoRepo, _tenant) = (repo, alunoRepo, tenant);
        (_assinaturaRepo, _planoRepo, _transportadorRepo) = (assinaturaRepo, planoRepo, transportadorRepo);
    }

    public async Task<Result<IEnumerable<CheckInDto>>> Handle(ListarCheckInsQuery request, CancellationToken ct)
    {
        var data = request.Data ?? DateOnly.FromDateTime(DateTime.UtcNow);

        if (_tenant.TenantId is Guid transportadorId)
        {
            var transportador = await _transportadorRepo.ObterPorIdAsync(transportadorId, ct);
            if (transportador?.Vitalicio != true)
            {
                var assinatura = await _assinaturaRepo.ObterPorTransportadorAsync(transportadorId, ct);
                if (assinatura is not null)
                {
                    var plano = await _planoRepo.ObterPorIdAsync(assinatura.PlanoId, ct);
                    if (plano?.RetencaoHistoricoDias is int retencao)
                    {
                        var dataMinima = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-retencao));
                        if (data < dataMinima)
                            return Result<IEnumerable<CheckInDto>>.Failure(
                                $"O plano '{plano.Nome}' permite histórico de apenas {retencao} dias. Faça upgrade para acessar registros mais antigos.");
                    }
                }
            }
        }

        var checkIns = await _repo.ListarCheckInsAsync(data, ct);
        var alunos = await _alunoRepo.ListarTodosAsync(ct);
        var alunoMap = alunos.ToDictionary(a => a.Id, a => (Nome: a.Nome, Turno: a.Turno.ToString()));

        var filtrados = checkIns.AsEnumerable();
        if (!string.IsNullOrWhiteSpace(request.Turno))
            filtrados = filtrados.Where(c =>
                alunoMap.TryGetValue(c.AlunoId, out var a) &&
                string.Equals(a.Turno, request.Turno, StringComparison.OrdinalIgnoreCase));

        var dtos = filtrados
            .OrderByDescending(c => c.HoraRegistro)
            .Select(c =>
            {
                var aluno = alunoMap.TryGetValue(c.AlunoId, out var a) ? a : (Nome: c.AlunoId.ToString(), Turno: "");
                return new CheckInDto(c.Id, c.AlunoId, aluno.Nome, aluno.Turno, c.Tipo, c.HoraRegistro, c.Latitude, c.Longitude, c.Endereco, c.ViagemId);
            });

        return Result<IEnumerable<CheckInDto>>.Success(dtos);
    }
}
