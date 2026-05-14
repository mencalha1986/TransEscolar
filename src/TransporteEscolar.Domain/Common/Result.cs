namespace TransporteEscolar.Domain.Common;

public class Result<T>
{
    public bool IsSuccess { get; }
    public T Value { get; } = default!;
    public string Error { get; } = default!;

    private Result(T value) { IsSuccess = true; Value = value; }
    private Result(string error) { IsSuccess = false; Error = error; }

    public static Result<T> Success(T value) => new(value);
    public static Result<T> Failure(string error) => new(error);
}
