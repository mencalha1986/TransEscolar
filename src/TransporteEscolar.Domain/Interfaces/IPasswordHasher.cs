namespace TransporteEscolar.Domain.Interfaces;

public interface IPasswordHasher
{
    string Hash(string senha);
    bool Verify(string senha, string hash);
}
