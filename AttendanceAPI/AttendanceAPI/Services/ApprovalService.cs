using AttendanceAPI.Data;
using AttendanceAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace AttendanceAPI.Services
{
    public class ApprovalService : IApprovalService
    {
        private readonly AttendanceDbContext _context;

        public ApprovalService(AttendanceDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ApprovalRequest>> GetApprovalRequestsAsync()
        {
            return await _context.ApprovalRequests
                .Include(ar => ar.User)
                .OrderByDescending(ar => ar.RequestedAt)
                .ToListAsync();
        }

        public async Task<ApprovalRequest> CreateApprovalRequestAsync(ApprovalRequest request)
        {
            request.Id = Guid.NewGuid();
            request.RequestedAt = DateTime.UtcNow;

            _context.ApprovalRequests.Add(request);
            await _context.SaveChangesAsync();

            return request;
        }

        public async Task<ApprovalRequest> UpdateApprovalRequestAsync(Guid id, string status, string approvedBy)
        {
            var request = await _context.ApprovalRequests.FindAsync(id);
            if (request == null)
            {
                throw new ArgumentException("Approval request not found");
            }

            request.Status = status;
            request.ApprovedBy = approvedBy;
            request.ApprovedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return request;
        }
    }
}