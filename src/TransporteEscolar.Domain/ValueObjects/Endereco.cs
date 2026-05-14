namespace TransporteEscolar.Domain.ValueObjects;

public sealed record Endereco(
    string Logradouro,
    string Numero,
    string Bairro,
    string Cidade,
    string Estado,
    string CEP);
