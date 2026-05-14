namespace TransporteEscolar.Application.Common;

public abstract record PaginationQuery(int Page = 1, int PageSize = 20);
