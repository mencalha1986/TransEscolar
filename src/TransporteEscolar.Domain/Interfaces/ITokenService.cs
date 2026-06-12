using TransporteEscolar.Domain.Entities;

namespace TransporteEscolar.Domain.Interfaces;

public interface ITokenService
{
    string GerarToken(Usuario usuario, TipoOperacao? tipoOperacao = null, Guid? motoristaId = null, bool? moduloFinanceiroAtivo = null);
}
