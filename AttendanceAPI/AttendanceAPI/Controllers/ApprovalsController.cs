using AttendanceAPI.Models;
using AttendanceAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AttendanceAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ApprovalsController : ControllerBase
    {
        private readonly IApprovalService _approvalService;

        public ApprovalsController(IApprovalService approvalService)
        {
            _approvalService = approvalService;
        }

        [HttpGet]
        public async Task<IActionResult> GetApprovalRequests()
        {
            var requests = await _approvalService.GetApprovalRequestsAsync();
            return Ok(requests);
        }

        [HttpPost]
        public async Task<IActionResult> CreateApprovalRequest([FromBody] CreateApprovalRequest request)
        {
            try
            {
                var approvalRequest = new ApprovalRequest
                {
                    UserId = request.UserId,
                    Type = request.Type,
                    Reason = request.Reason,
                    Status = "pending"
                };

                var createdRequest = await _approvalService.CreateApprovalRequestAsync(approvalRequest);
                return CreatedAtAction(nameof(GetApprovalRequests), createdRequest);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateApprovalRequest(Guid id, [FromBody] UpdateApprovalRequest request)
        {
            try
            {
                var updatedRequest = await _approvalService.UpdateApprovalRequestAsync(id, request.Status, request.ApprovedBy);
                return Ok(updatedRequest);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }

    public class CreateApprovalRequest
    {
        public Guid UserId { get; set; }
        public string Type { get; set; } = string.Empty;
        public string Reason { get; set; } = string.Empty;
    }

    public class UpdateApprovalRequest
    {
        public string Status { get; set; } = string.Empty;
        public string ApprovedBy { get; set; } = string.Empty;
    }
}