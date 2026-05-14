using TransporteEscolar.Domain.Common;

namespace TransporteEscolar.Domain.ValueObjects;

public sealed class CPF : IEquatable<CPF>
{
    public string Numero { get; }

    private CPF(string numero) => Numero = numero;

    public static Result<CPF> Create(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return Result<CPF>.Failure("CPF não pode ser vazio.");

        var digits = new string(value.Where(char.IsDigit).ToArray());
        if (digits.Length != 11)
            return Result<CPF>.Failure("CPF deve ter 11 dígitos.");

        if (digits.Distinct().Count() == 1)
            return Result<CPF>.Failure("CPF inválido.");

        if (!ValidateDigits(digits))
            return Result<CPF>.Failure("CPF inválido.");

        return Result<CPF>.Success(new CPF(digits));
    }

    private static bool ValidateDigits(string digits)
    {
        int sum = 0;
        for (int i = 0; i < 9; i++) sum += (digits[i] - '0') * (10 - i);
        int first = sum % 11 < 2 ? 0 : 11 - sum % 11;
        if (first != digits[9] - '0') return false;

        sum = 0;
        for (int i = 0; i < 10; i++) sum += (digits[i] - '0') * (11 - i);
        int second = sum % 11 < 2 ? 0 : 11 - sum % 11;
        return second == digits[10] - '0';
    }

    public bool Equals(CPF? other) => other is not null && Numero == other.Numero;
    public override bool Equals(object? obj) => obj is CPF cpf && Equals(cpf);
    public override int GetHashCode() => Numero.GetHashCode();
    public override string ToString() =>
        $"{Numero[..3]}.{Numero[3..6]}.{Numero[6..9]}-{Numero[9..]}";
}
