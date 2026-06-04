namespace TransporteEscolar.Application.Common;

public class AssinaturaInadimplenteException : Exception
{
    public AssinaturaInadimplenteException()
        : base("Sua assinatura está inadimplente. Acesse 'Minha Assinatura' e realize o pagamento via PIX para reativar o acesso.") { }
}
