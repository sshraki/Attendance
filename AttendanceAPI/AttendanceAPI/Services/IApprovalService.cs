using AttendanceAPI.Models;

namespace AttendanceAPI.Services
{
    public interface IApprovalService
    {
        Task<IEnumerable<ApprovalRequest>> GetApprovalRequestsAsync();
        Task<ApprovalRequest> CreateApprovalRequestAsync(ApprovalRequest request);
        Task<ApprovalRequest> UpdateApprovalRequestAsync(Guid id, string status, string approvedBy);
    }
}