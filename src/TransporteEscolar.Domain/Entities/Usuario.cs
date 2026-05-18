using TransporteEscolar.Domain.Common;

namespace TransporteEscolar.Domain.Entities;

public enum PerfilUsuario { Admin, Motorista, Responsavel, SuperAdmin }

public class Usuario : Entity
{
    public string Nome { get; private set; } = default!;
    public string Email { get; private set; } = default!;
    public string PasswordHash { get; private set; } = default!;
    public PerfilUsuario Perfil { get; private set; }
    public bool MustChangePassword { get; private set; }
    public Guid? TransportadorId { get; private set; }

    private Usuario() { }

    public static Result<Usuario> Criar(string nome, string email, string passwordHash, PerfilUsuario perfil, Guid? transportadorId = null, bool mustChangePassword = false)
    {
        if (string.IsNullOrWhiteSpace(nome))
            return Result<Usuario>.Failure("Nome é obrigatório.");
        if (string.IsNullOrWhiteSpace(email) || !email.Contains('@'))
            return Result<Usuario>.Failure("Email inválido.");
        if (string.IsNullOrWhiteSpace(passwordHash))
            return Result<Usuario>.Failure("PasswordHash é obrigatório.");

        return Result<Usuario>.Success(new Usuario
        {
            Nome = nome,
            Email = email.ToLowerInvariant(),
            PasswordHash = passwordHash,
            Perfil = perfil,
            TransportadorId = transportadorId,
            MustChangePassword = mustChangePassword
        });
    }

    public Result<bool> AlterarSenha(string senhaAtualHash, string novaSenhaHash, bool verificarAtual = true)
    {
        PasswordHash = novaSenhaHash;
        MustChangePassword = false;
        MarcarAtualizado();
        return Result<bool>.Success(true);
    }
}
