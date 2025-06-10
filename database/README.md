# AttendancePro Database Setup

This directory contains SQL scripts to set up the AttendancePro database with SQL Server.

## Prerequisites

- SQL Server 2019 or later (or SQL Server Express)
- SQL Server Management Studio (SSMS) or Azure Data Studio

## Setup Instructions

### 1. Create Database and Schema

Run the `create_database.sql` script to create the database and all required tables:

```sql
-- Execute in SQL Server Management Studio or Azure Data Studio
-- File: create_database.sql
```

This script will:
- Create the `AttendanceDB` database
- Create all required tables with proper relationships
- Set up indexes for optimal performance
- Configure foreign key constraints

### 2. Seed Sample Data

Run the `seed_data.sql` script to populate the database with sample data:

```sql
-- Execute after running create_database.sql
-- File: seed_data.sql
```

This script will:
- Insert default system settings
- Create sample users (admin, manager, employees)
- Generate sample attendance records for the last 7 days
- Add sample approval requests

## Database Schema

### Tables Overview

1. **Users** - Employee information and authentication
2. **AttendanceRecords** - Daily attendance tracking
3. **BreakRecords** - Break time tracking
4. **ApprovalRequests** - Late arrivals, extended breaks, early checkouts
5. **FaceData** - Face recognition data storage
6. **Settings** - System configuration

### Default Users

After running the seed script, you'll have these test accounts:

| Role | Employee ID | Email | Password |
|------|-------------|-------|----------|
| Admin | ADMIN001 | admin@company.com | admin123 |
| Manager | MGR001 | john.manager@company.com | manager123 |
| Employee | EMP001 | jane.employee@company.com | employee123 |

## Connection String

Update the connection string in `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=AttendanceDB;Trusted_Connection=true;MultipleActiveResultSets=true"
  }
}
```

For SQL Server Express:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=.\\SQLEXPRESS;Database=AttendanceDB;Trusted_Connection=true;MultipleActiveResultSets=true"
  }
}
```

For Azure SQL Database:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=tcp:yourserver.database.windows.net,1433;Initial Catalog=AttendanceDB;Persist Security Info=False;User ID=yourusername;Password=yourpassword;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"
  }
}
```

## Entity Framework Migrations

If you prefer using Entity Framework migrations instead of SQL scripts:

1. Install EF Core tools:
```bash
dotnet tool install --global dotnet-ef
```

2. Create initial migration:
```bash
dotnet ef migrations add InitialCreate
```

3. Update database:
```bash
dotnet ef database update
```

## Performance Considerations

The database includes several indexes for optimal performance:

- `IX_Users_EmployeeId` - Fast employee lookup
- `IX_Users_Email` - Email-based queries
- `IX_AttendanceRecords_Date` - Date range queries
- `IX_AttendanceRecords_UserId` - User-specific attendance
- `IX_ApprovalRequests_Status` - Status filtering
- `IX_ApprovalRequests_RequestedAt` - Time-based queries

## Backup and Maintenance

### Regular Backups
```sql
BACKUP DATABASE AttendanceDB 
TO DISK = 'C:\Backups\AttendanceDB.bak'
WITH FORMAT, INIT;
```

### Database Maintenance
```sql
-- Update statistics
UPDATE STATISTICS AttendanceRecords;
UPDATE STATISTICS Users;

-- Rebuild indexes (run monthly)
ALTER INDEX ALL ON AttendanceRecords REBUILD;
ALTER INDEX ALL ON Users REBUILD;
```

## Security Notes

1. **Change Default Passwords**: Update all default user passwords in production
2. **Use Strong Connection Strings**: Never store passwords in plain text
3. **Enable Encryption**: Use encrypted connections in production
4. **Regular Updates**: Keep SQL Server updated with latest security patches
5. **Access Control**: Implement proper database user roles and permissions

## Troubleshooting

### Common Issues

1. **Connection Failed**: Check SQL Server service is running
2. **Permission Denied**: Ensure user has database creation rights
3. **Database Exists**: Drop existing database if recreating
4. **Foreign Key Errors**: Ensure parent records exist before inserting child records

### Useful Queries

```sql
-- Check database size
SELECT 
    DB_NAME() AS DatabaseName,
    (SELECT SUM(size) * 8 / 1024 FROM sys.database_files WHERE type = 0) AS DataSizeMB,
    (SELECT SUM(size) * 8 / 1024 FROM sys.database_files WHERE type = 1) AS LogSizeMB;

-- View table row counts
SELECT 
    t.name AS TableName,
    p.rows AS RowCount
FROM sys.tables t
INNER JOIN sys.partitions p ON t.object_id = p.object_id
WHERE p.index_id IN (0,1);

-- Check recent attendance
SELECT TOP 10 
    u.Name,
    u.EmployeeId,
    ar.Date,
    ar.CheckIn,
    ar.CheckOut,
    ar.Status
FROM AttendanceRecords ar
INNER JOIN Users u ON ar.UserId = u.Id
ORDER BY ar.Date DESC, ar.CheckIn DESC;
```