using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Mensalidades.Queries.ListarMensalidades;

public class ListarMensalidadesHandler : IRequestHandler<ListarMensalidadesQuery, Result<IEnumerable<MensalidadeDto>>>
{
    private readonly IMensalidadeRepository _mensalidadeRepo;
    private readonly IAlunoRepository _alunoRepo;
    private readonly IResponsavelRepository _responsavelRepo;

    public ListarMensalidadesHandler(IMensalidadeRepository mensalidadeRepo, IAlunoRepository alunoRepo, IResponsavelRepository responsavelRepo)
        => (_mensalidadeRepo, _alunoRepo, _responsavelRepo) = (mensalidadeRepo, alunoRepo, responsavelRepo);

    public async Task<Result<IEnumerable<MensalidadeDto>>> Handle(ListarMensalidadesQuery request, CancellationToken ct)
    {
        var mensalidades = await _mensalidadeRepo.ListarTodosComFiltroAsync(request.AlunoId, request.Status, ct);

        var alunoIds = mensalidades.Select(m => m.AlunoId).Distinct().ToList();
        var alunos = (await _alunoRepo.ListarTodosAsync(ct))
            .Where(a => alunoIds.Contains(a.Id))
            .ToDictionary(a => a.Id);

        var todosResponsavelIds = alunos.Values
            .SelectMany(a => a.ResponsavelIds)
            .Distinct();
        var responsaveis = (await _responsavelRepo.ListarPorIdsAsync(todosResponsavelIds, ct))
            .ToDictionary(r => r.Id, r => r.Nome);

        var dtos = mensalidades.Select(m =>
        {
            alunos.TryGetValue(m.AlunoId, out var aluno);
            var nomesResp = aluno?.ResponsavelIds
                .Select(id => responsaveis.GetValueOrDefault(id, ""))
                .Where(n => n.Length > 0)
                .ToList() ?? [];
            return new MensalidadeDto(
                m.Id,
                m.AlunoId,
                aluno?.Nome ?? "Desconhecido",
                aluno?.Turno.ToString() ?? "",
                nomesResp,
                m.Competencia,
                m.DataVencimento,
                m.Valor,
                m.Status.ToString(),
                m.DataPagamento);
        });

        return Result<IEnumerable<MensalidadeDto>>.Success(dtos);
    }
}
