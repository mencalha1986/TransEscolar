using Microsoft.AspNetCore.Mvc;

namespace TransporteEscolar.API.Common;

[ApiController]
public abstract class BaseController : ControllerBase
{
    protected IActionResult OkResponse<T>(T data) =>
        Ok(ApiResponse<T>.Ok(data));

    protected IActionResult CreatedResponse<T>(string actionName, object routeValues, T data) =>
        CreatedAtAction(actionName, routeValues, ApiResponse<T>.Ok(data));

    protected IActionResult ErrorResponse(string error) =>
        BadRequest(ApiResponse<object>.Fail(error));

    protected IActionResult NotFoundResponse(string error) =>
        NotFound(ApiResponse<object>.Fail(error));
}
