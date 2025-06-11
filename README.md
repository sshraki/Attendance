# AttendancePro - Face Recognition Attendance System

A comprehensive attendance management system with face recognition capabilities, built with Next.js frontend and .NET Core API backend.

## 🚀 Features

- **Face Recognition** - Advanced face detection and recognition for seamless check-in/out
- **Role-based Access Control** - Admin, Manager, and Employee roles with appropriate permissions
- **Real-time Attendance Tracking** - Live monitoring of employee attendance status
- **Break Management** - Track break times with approval workflows
- **Approval System** - Manager approval for late arrivals, extended breaks, and early checkouts
- **Comprehensive Reports** - Detailed attendance, work hours, and leave reports with CSV export
- **Dashboard Analytics** - Real-time statistics and insights
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices

## 🛠️ Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Face-API.js** - Face recognition and detection
- **Lucide React** - Beautiful icons
- **Axios** - HTTP client for API calls

### Backend
- **.NET Core 8** - High-performance web API
- **Entity Framework Core** - Object-relational mapping
- **SQL Server** - Robust database management
- **JWT Authentication** - Secure token-based authentication
- **BCrypt** - Password hashing
- **Swagger/OpenAPI** - API documentation

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **.NET 8 SDK**
- **SQL Server** (LocalDB, Express, or Full)
- **Modern web browser** with camera support

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/attendance-face-recognition-system.git
cd attendance-face-recognition-system
```

### 2. Database Setup
```bash
# Navigate to database folder
cd database

# Run the SQL scripts in SQL Server Management Studio or Azure Data Studio
# 1. Execute create_database.sql
# 2. Execute seed_data.sql
```

### 3. Backend Setup
```bash
# Navigate to API project
cd AttendanceAPI/AttendanceAPI

# Update connection string in appsettings.json if needed
# Restore packages and run
dotnet restore
dotnet run
```

The API will be available at `https://localhost:7001`

### 4. Frontend Setup
```bash
# Navigate to project root
cd ../..

# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local

# Update API URL in .env.local if needed
# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

## 👥 Default Test Accounts

After running the seed script, you'll have these test accounts:

| Role | Employee ID | Email | Password |
|------|-------------|-------|----------|
| Admin | ADMIN001 | admin@company.com | admin123 |
| Manager | MGR001 | john.manager@company.com | manager123 |
| Employee | EMP001 | jane.employee@company.com | employee123 |

## 📱 Usage

### For Employees
1. **Face Registration** - Register your face through the employee registration page
2. **Check In/Out** - Use face recognition for seamless attendance tracking
3. **Break Management** - Start and end breaks with automatic time tracking
4. **View Records** - Check your attendance history and work hours

### For Managers
1. **Team Overview** - Monitor team attendance and performance
2. **Approval Management** - Approve/reject late arrivals, breaks, and early checkouts
3. **Reports** - Generate detailed reports for your team
4. **Employee Management** - Add and manage team members

### For Administrators
1. **System Management** - Configure system settings and policies
2. **User Management** - Manage all users across the organization
3. **Analytics** - Access comprehensive dashboard with insights
4. **Reports** - Generate organization-wide reports

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=https://localhost:7001/api
```

### Database Connection
Update `appsettings.json` in the API project:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=AttendanceDB;Trusted_Connection=true;MultipleActiveResultSets=true"
  }
}
```

## 📊 API Documentation

Once the backend is running, visit `https://localhost:7001/swagger` for interactive API documentation.

### Key Endpoints
- `POST /api/auth/login` - User authentication
- `GET /api/attendance/today/{employeeId}` - Get today's attendance
- `POST /api/attendance/checkin` - Check in with face recognition
- `POST /api/attendance/checkout` - Check out
- `GET /api/reports/attendance` - Generate attendance reports
- `GET /api/dashboard/stats` - Dashboard statistics

## 🔒 Security Features

- **JWT Authentication** with secure token handling
- **Password Hashing** using BCrypt
- **Role-based Authorization** on all endpoints
- **CORS Configuration** for secure cross-origin requests
- **Input Validation** and sanitization
- **SQL Injection Protection** through Entity Framework

## 📈 Performance Optimizations

- **Database Indexing** for fast queries
- **Lazy Loading** for efficient data fetching
- **Image Optimization** for face recognition
- **Caching Strategies** for improved response times
- **Responsive Design** for optimal mobile performance

## 🧪 Testing

### Frontend Testing
```bash
npm run test
```

### Backend Testing
```bash
cd AttendanceAPI
dotnet test
```

## 📦 Deployment

### Frontend (Vercel)
```bash
npm run build
# Deploy to Vercel or your preferred hosting platform
```

### Backend (Azure/IIS)
```bash
cd AttendanceAPI/AttendanceAPI
dotnet publish -c Release
# Deploy to Azure App Service or IIS
```

### Database (Azure SQL/SQL Server)
- Run migration scripts on production database
- Update connection strings in production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the API documentation at `/swagger`

## 🙏 Acknowledgments

- Face-API.js for face recognition capabilities
- Next.js team for the amazing framework
- .NET team for the robust backend framework
- Tailwind CSS for the utility-first CSS framework

---

**Built with ❤️ for modern workforce management**