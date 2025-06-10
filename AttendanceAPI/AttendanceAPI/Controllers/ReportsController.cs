using AttendanceAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AttendanceAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ReportsController : ControllerBase
    {
        private readonly IReportService _reportService;

        public ReportsController(IReportService reportService)
        {
            _reportService = reportService;
        }

        [HttpGet("attendance")]
        public async Task<IActionResult> GetAttendanceReport(
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate,
            [FromQuery] string? employeeId)
        {
            var report = await _reportService.GetAttendanceReportAsync(startDate, endDate, employeeId);
            return Ok(report);
        }

        [HttpGet("workhours")]
        public async Task<IActionResult> GetWorkHoursReport(
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate,
            [FromQuery] string? employeeId)
        {
            var report = await _reportService.GetWorkHoursReportAsync(startDate, endDate, employeeId);
            return Ok(report);
        }

        [HttpGet("leaves")]
        public async Task<IActionResult> GetLeavesReport(
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate,
            [FromQuery] string? employeeId)
        {
            var report = await _reportService.GetLeavesReportAsync(startDate, endDate, employeeId);
            return Ok(report);
        }
    }
}