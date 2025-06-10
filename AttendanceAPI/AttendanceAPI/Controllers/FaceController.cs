using AttendanceAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AttendanceAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class FaceController : ControllerBase
    {
        private readonly IFaceRecognitionService _faceRecognitionService;

        public FaceController(IFaceRecognitionService faceRecognitionService)
        {
            _faceRecognitionService = faceRecognitionService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> RegisterFace([FromBody] RegisterFaceRequest request)
        {
            try
            {
                await _faceRecognitionService.RegisterFaceAsync(request.EmployeeId, request.FaceData);
                return Ok(new { message = "Face registered successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("recognize")]
        public async Task<IActionResult> RecognizeFace([FromBody] RecognizeFaceRequest request)
        {
            try
            {
                var employeeId = await _faceRecognitionService.RecognizeFaceAsync(request.FaceData);
                if (employeeId == null)
                {
                    return NotFound(new { message = "Face not recognized" });
                }
                return Ok(new { employeeId });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }

    public class RegisterFaceRequest
    {
        public string EmployeeId { get; set; } = string.Empty;
        public string FaceData { get; set; } = string.Empty;
    }

    public class RecognizeFaceRequest
    {
        public string FaceData { get; set; } = string.Empty;
    }
}