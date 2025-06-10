using AttendanceAPI.Data;
using AttendanceAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace AttendanceAPI.Services
{
    public class FaceRecognitionService : IFaceRecognitionService
    {
        private readonly AttendanceDbContext _context;

        public FaceRecognitionService(AttendanceDbContext context)
        {
            _context = context;
        }

        public async Task RegisterFaceAsync(string employeeId, string faceData)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.EmployeeId == employeeId);
            if (user == null)
            {
                throw new ArgumentException("User not found");
            }

            var existingFaceData = await _context.FaceData.FirstOrDefaultAsync(fd => fd.UserId == user.Id);
            if (existingFaceData != null)
            {
                existingFaceData.FaceDescriptor = faceData;
                existingFaceData.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                var newFaceData = new FaceData
                {
                    Id = Guid.NewGuid(),
                    UserId = user.Id,
                    FaceDescriptor = faceData,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _context.FaceData.Add(newFaceData);
            }

            await _context.SaveChangesAsync();
        }

        public async Task<string?> RecognizeFaceAsync(string faceData)
        {
            // In a real implementation, this would use face recognition algorithms
            // to compare the provided face data with stored face descriptors
            // For now, we'll implement a simple matching mechanism
            
            var allFaceData = await _context.FaceData
                .Include(fd => fd.User)
                .ToListAsync();

            // Simple comparison - in reality, you'd use cosine similarity or other algorithms
            foreach (var storedFace in allFaceData)
            {
                if (CompareFaceDescriptors(faceData, storedFace.FaceDescriptor))
                {
                    return storedFace.User.EmployeeId;
                }
            }

            return null;
        }

        private bool CompareFaceDescriptors(string faceData1, string faceData2)
        {
            // Simplified comparison - in a real implementation, you would:
            // 1. Decode the base64 face descriptors
            // 2. Calculate cosine similarity or Euclidean distance
            // 3. Return true if similarity is above a threshold (e.g., 0.6)
            
            // For demo purposes, we'll do a simple string comparison
            // This should be replaced with proper face recognition algorithms
            return faceData1 == faceData2;
        }
    }
}