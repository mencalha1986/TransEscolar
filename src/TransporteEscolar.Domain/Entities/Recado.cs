using TransporteEscolar.Domain.Common;

namespace TransporteEscolar.Domain.Entities;

public enum TipoRecado { Geral, ParaResponsavel, ParaTurno, ParaEscola, DoResponsavel }

public class Recado : Entity
{
    public string Conteudo { get; private set; } = default!;
    public TipoRecado Tipo { get; private set; }
    public Guid AutorId { get; private set; }
    public string AutorNome { get; private set; } = default!;
    public Guid? DestinatarioUsuarioId { get; private set; }
    public TurnoAluno? TurnoFiltro { get; private set; }
    public Guid? EscolaFiltroId { get; private set; }
    public Guid TransportadorId { get; private set; }

    private Recado() { }

    public static Result<Recado> Criar(
        string conteudo,
        TipoRecado tipo,
        Guid autorId,
        string autorNome,
        Guid transportadorId,
        Guid? destinatarioUsuarioId = null,
        TurnoAluno? turnoFiltro = null,
        Guid? escolaFiltroId = null)
    {
        if (string.IsNullOrWhiteSpace(conteudo))
            return Result<Recado>.Failure("Conteúdo do recado é obrigatório.");

        return Result<Recado>.Success(new Recado
        {
            Conteudo = conteudo,
            Tipo = tipo,
            AutorId = autorId,
            AutorNome = autorNome,
            TransportadorId = transportadorId,
            DestinatarioUsuarioId = destinatarioUsuarioId,
            TurnoFiltro = turnoFiltro,
            EscolaFiltroId = escolaFiltroId,
        });
    }
}
