namespace AttendanceAPI.Services
{
    public interface IFaceRecognitionService
    {
        Task RegisterFaceAsync(string employeeId, string faceData);
        Task<string?> RecognizeFaceAsync(string faceData);
    }
}