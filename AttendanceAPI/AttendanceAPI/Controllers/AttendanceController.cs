using AttendanceAPI.Models;
using AttendanceAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AttendanceAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AttendanceController : ControllerBase
    {
        private readonly IAttendanceService _attendanceService;

        public AttendanceController(IAttendanceService attendanceService)
        {
            _attendanceService = attendanceService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAttendanceRecords(
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate,
            [FromQuery] string? employeeId)
        {
            var records = await _attendanceService.GetAttendanceRecordsAsync(startDate, endDate, employeeId);
            return Ok(records);
        }

        [HttpGet("today/{employeeId}")]
        public async Task<IActionResult> GetTodayAttendance(string employeeId)
        {
            var record = await _attendanceService.GetTodayAttendanceAsync(employeeId);
            if (record == null)
            {
                return NotFound();
            }
            return Ok(record);
        }

        [HttpPost("checkin")]
        public async Task<IActionResult> CheckIn([FromBody] CheckInRequest request)
        {
            try
            {
                var record = await _attendanceService.CheckInAsync(request.EmployeeId, request.FaceData);
                return Ok(record);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("checkout")]
        public async Task<IActionResult> CheckOut([FromBody] CheckOutRequest request)
        {
            try
            {
                var record = await _attendanceService.CheckOutAsync(request.EmployeeId, request.Reason, request.Type);
                return Ok(record);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("break/start")]
        public async Task<IActionResult> StartBreak([FromBody] BreakRequest request)
        {
            try
            {
                var record = await _attendanceService.StartBreakAsync(request.EmployeeId);
                return Ok(record);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("break/end")]
        public async Task<IActionResult> EndBreak([FromBody] BreakRequest request)
        {
            try
            {
                var record = await _attendanceService.EndBreakAsync(request.EmployeeId);
                return Ok(record);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateAttendanceRecord([FromBody] AttendanceRecord record)
        {
            try
            {
                var createdRecord = await _attendanceService.CreateAttendanceRecordAsync(record);
                return CreatedAtAction(nameof(GetTodayAttendance), new { employeeId = record.User.EmployeeId }, createdRecord);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAttendanceRecord(Guid id, [FromBody] AttendanceRecord record)
        {
            try
            {
                record.Id = id;
                var updatedRecord = await _attendanceService.UpdateAttendanceRecordAsync(record);
                return Ok(updatedRecord);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }

    public class CheckInRequest
    {
        public string EmployeeId { get; set; } = string.Empty;
        public string? FaceData { get; set; }
    }

    public class CheckOutRequest
    {
        public string EmployeeId { get; set; } = string.Empty;
        public string? Reason { get; set; }
        public string? Type { get; set; }
    }

    public class BreakRequest
    {
        public string EmployeeId { get; set; } = string.Empty;
    }
}