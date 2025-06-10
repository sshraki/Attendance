-- Create AttendanceDB Database
USE master;
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'AttendanceDB')
BEGIN
    CREATE DATABASE AttendanceDB;
END
GO

USE AttendanceDB;
GO

-- Create Users table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' AND xtype='U')
BEGIN
    CREATE TABLE Users (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        EmployeeId NVARCHAR(50) NOT NULL UNIQUE,
        Name NVARCHAR(100) NOT NULL,
        Email NVARCHAR(100) NOT NULL UNIQUE,
        Role NVARCHAR(20) NOT NULL DEFAULT 'employee',
        Department NVARCHAR(100) NOT NULL,
        ManagerId UNIQUEIDENTIFIER NULL,
        PasswordHash NVARCHAR(255) NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        IsActive BIT NOT NULL DEFAULT 1,
        
        CONSTRAINT FK_Users_Manager FOREIGN KEY (ManagerId) REFERENCES Users(Id)
    );
END
GO

-- Create AttendanceRecords table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='AttendanceRecords' AND xtype='U')
BEGIN
    CREATE TABLE AttendanceRecords (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        UserId UNIQUEIDENTIFIER NOT NULL,
        Date DATE NOT NULL,
        CheckIn DATETIME2 NULL,
        CheckOut DATETIME2 NULL,
        TotalWorkHours DECIMAL(5,2) NOT NULL DEFAULT 0,
        TotalBreakTime INT NOT NULL DEFAULT 0,
        IsLate BIT NOT NULL DEFAULT 0,
        LateReason NVARCHAR(500) NULL,
        LateApproved BIT NOT NULL DEFAULT 0,
        CheckoutReason NVARCHAR(500) NULL,
        CheckoutType NVARCHAR(50) NULL,
        CheckoutApproved BIT NOT NULL DEFAULT 0,
        Status NVARCHAR(20) NOT NULL DEFAULT 'absent',
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        
        CONSTRAINT FK_AttendanceRecords_User FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
        CONSTRAINT UQ_AttendanceRecords_UserDate UNIQUE (UserId, Date)
    );
END
GO

-- Create BreakRecords table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='BreakRecords' AND xtype='U')
BEGIN
    CREATE TABLE BreakRecords (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        AttendanceRecordId UNIQUEIDENTIFIER NOT NULL,
        StartTime DATETIME2 NOT NULL,
        EndTime DATETIME2 NULL,
        Duration INT NOT NULL DEFAULT 0,
        Reason NVARCHAR(500) NULL,
        Approved BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        
        CONSTRAINT FK_BreakRecords_AttendanceRecord FOREIGN KEY (AttendanceRecordId) REFERENCES AttendanceRecords(Id) ON DELETE CASCADE
    );
END
GO

-- Create ApprovalRequests table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ApprovalRequests' AND xtype='U')
BEGIN
    CREATE TABLE ApprovalRequests (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        UserId UNIQUEIDENTIFIER NOT NULL,
        Type NVARCHAR(20) NOT NULL,
        Reason NVARCHAR(1000) NOT NULL,
        Status NVARCHAR(20) NOT NULL DEFAULT 'pending',
        RequestedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        ApprovedBy NVARCHAR(100) NULL,
        ApprovedAt DATETIME2 NULL,
        
        CONSTRAINT FK_ApprovalRequests_User FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
    );
END
GO

-- Create FaceData table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='FaceData' AND xtype='U')
BEGIN
    CREATE TABLE FaceData (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        UserId UNIQUEIDENTIFIER NOT NULL UNIQUE,
        FaceDescriptor NVARCHAR(MAX) NOT NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        
        CONSTRAINT FK_FaceData_User FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
    );
END
GO

-- Create Settings table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Settings' AND xtype='U')
BEGIN
    CREATE TABLE Settings (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        MaxBreakTime INT NOT NULL DEFAULT 60,
        MaxLateTime INT NOT NULL DEFAULT 15,
        MaxOvertime INT NOT NULL DEFAULT 120,
        MinCheckInTime NVARCHAR(5) NOT NULL DEFAULT '08:00',
        MaxCheckInTime NVARCHAR(5) NOT NULL DEFAULT '10:00',
        MinCheckOutTime NVARCHAR(5) NOT NULL DEFAULT '16:00',
        MaxCheckOutTime NVARCHAR(5) NOT NULL DEFAULT '20:00',
        WorkingHoursPerDay INT NOT NULL DEFAULT 8,
        UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
    );
END
GO

-- Create indexes for better performance
CREATE NONCLUSTERED INDEX IX_Users_EmployeeId ON Users(EmployeeId);
CREATE NONCLUSTERED INDEX IX_Users_Email ON Users(Email);
CREATE NONCLUSTERED INDEX IX_AttendanceRecords_Date ON AttendanceRecords(Date);
CREATE NONCLUSTERED INDEX IX_AttendanceRecords_UserId ON AttendanceRecords(UserId);
CREATE NONCLUSTERED INDEX IX_ApprovalRequests_Status ON ApprovalRequests(Status);
CREATE NONCLUSTERED INDEX IX_ApprovalRequests_RequestedAt ON ApprovalRequests(RequestedAt);
GO

PRINT 'Database schema created successfully!';