USE AttendanceDB;
GO

-- Insert default settings if not exists
IF NOT EXISTS (SELECT 1 FROM Settings)
BEGIN
    INSERT INTO Settings (Id, MaxBreakTime, MaxLateTime, MaxOvertime, MinCheckInTime, MaxCheckInTime, MinCheckOutTime, MaxCheckOutTime, WorkingHoursPerDay, UpdatedAt)
    VALUES (NEWID(), 60, 15, 120, '08:00', '10:00', '16:00', '20:00', 8, GETUTCDATE());
    
    PRINT 'Default settings inserted.';
END
GO

-- Insert sample users if not exists
IF NOT EXISTS (SELECT 1 FROM Users WHERE EmployeeId = 'ADMIN001')
BEGIN
    DECLARE @AdminId UNIQUEIDENTIFIER = NEWID();
    DECLARE @ManagerId UNIQUEIDENTIFIER = NEWID();
    DECLARE @EmployeeId UNIQUEIDENTIFIER = NEWID();
    
    -- Insert Admin User
    INSERT INTO Users (Id, EmployeeId, Name, Email, Role, Department, PasswordHash, CreatedAt, IsActive)
    VALUES (@AdminId, 'ADMIN001', 'System Administrator', 'admin@company.com', 'admin', 'IT', 
            '$2a$11$8K1p/a0dL2LkqvQOuiOX2uy7lQompaqtbyaHFJfLMvVlQs8/SqS1.', -- admin123
            GETUTCDATE(), 1);
    
    -- Insert Manager User
    INSERT INTO Users (Id, EmployeeId, Name, Email, Role, Department, PasswordHash, CreatedAt, IsActive)
    VALUES (@ManagerId, 'MGR001', 'John Manager', 'john.manager@company.com', 'manager', 'Operations',
            '$2a$11$8K1p/a0dL2LkqvQOuiOX2uy7lQompaqtbyaHFJfLMvVlQs8/SqS1.', -- manager123
            GETUTCDATE(), 1);
    
    -- Insert Employee User
    INSERT INTO Users (Id, EmployeeId, Name, Email, Role, Department, ManagerId, PasswordHash, CreatedAt, IsActive)
    VALUES (@EmployeeId, 'EMP001', 'Jane Employee', 'jane.employee@company.com', 'employee', 'Operations', @ManagerId,
            '$2a$11$8K1p/a0dL2LkqvQOuiOX2uy7lQompaqtbyaHFJfLMvVlQs8/SqS1.', -- employee123
            GETUTCDATE(), 1);
    
    -- Insert more sample employees
    INSERT INTO Users (Id, EmployeeId, Name, Email, Role, Department, ManagerId, PasswordHash, CreatedAt, IsActive)
    VALUES 
        (NEWID(), 'EMP002', 'Bob Smith', 'bob.smith@company.com', 'employee', 'Operations', @ManagerId,
         '$2a$11$8K1p/a0dL2LkqvQOuiOX2uy7lQompaqtbyaHFJfLMvVlQs8/SqS1.', GETUTCDATE(), 1),
        (NEWID(), 'EMP003', 'Alice Johnson', 'alice.johnson@company.com', 'employee', 'IT', @AdminId,
         '$2a$11$8K1p/a0dL2LkqvQOuiOX2uy7lQompaqtbyaHFJfLMvVlQs8/SqS1.', GETUTCDATE(), 1),
        (NEWID(), 'EMP004', 'Charlie Brown', 'charlie.brown@company.com', 'employee', 'HR', NULL,
         '$2a$11$8K1p/a0dL2LkqvQOuiOX2uy7lQompaqtbyaHFJfLMvVlQs8/SqS1.', GETUTCDATE(), 1);
    
    PRINT 'Sample users inserted.';
END
GO

-- Insert sample attendance records for the last 7 days
DECLARE @StartDate DATE = DATEADD(DAY, -7, GETDATE());
DECLARE @EndDate DATE = GETDATE();
DECLARE @CurrentDate DATE = @StartDate;

WHILE @CurrentDate <= @EndDate
BEGIN
    -- Skip weekends
    IF DATEPART(WEEKDAY, @CurrentDate) NOT IN (1, 7) -- Sunday = 1, Saturday = 7
    BEGIN
        -- Get sample users
        DECLARE @Users TABLE (UserId UNIQUEIDENTIFIER, EmployeeId NVARCHAR(50));
        INSERT INTO @Users SELECT Id, EmployeeId FROM Users WHERE Role IN ('employee', 'manager') AND IsActive = 1;
        
        DECLARE @UserId UNIQUEIDENTIFIER, @EmployeeId NVARCHAR(50);
        DECLARE user_cursor CURSOR FOR SELECT UserId, EmployeeId FROM @Users;
        OPEN user_cursor;
        FETCH NEXT FROM user_cursor INTO @UserId, @EmployeeId;
        
        WHILE @@FETCH_STATUS = 0
        BEGIN
            -- Only insert if record doesn't exist
            IF NOT EXISTS (SELECT 1 FROM AttendanceRecords WHERE UserId = @UserId AND Date = @CurrentDate)
            BEGIN
                DECLARE @CheckInTime DATETIME2 = DATEADD(MINUTE, ABS(CHECKSUM(NEWID())) % 60 + 480, @CurrentDate); -- 8:00-9:00 AM
                DECLARE @CheckOutTime DATETIME2 = DATEADD(HOUR, 8 + (ABS(CHECKSUM(NEWID())) % 2), @CheckInTime); -- 8-9 hours later
                DECLARE @IsLate BIT = CASE WHEN DATEPART(MINUTE, @CheckInTime) > 15 THEN 1 ELSE 0 END;
                DECLARE @WorkHours DECIMAL(5,2) = DATEDIFF(MINUTE, @CheckInTime, @CheckOutTime) / 60.0;
                
                DECLARE @AttendanceId UNIQUEIDENTIFIER = NEWID();
                
                INSERT INTO AttendanceRecords (Id, UserId, Date, CheckIn, CheckOut, TotalWorkHours, TotalBreakTime, IsLate, LateApproved, Status, CreatedAt, UpdatedAt)
                VALUES (@AttendanceId, @UserId, @CurrentDate, @CheckInTime, @CheckOutTime, @WorkHours, 30, @IsLate, 1, 'present', @CheckInTime, @CheckOutTime);
                
                -- Add a break record
                INSERT INTO BreakRecords (Id, AttendanceRecordId, StartTime, EndTime, Duration, Approved, CreatedAt)
                VALUES (NEWID(), @AttendanceId, DATEADD(HOUR, 4, @CheckInTime), DATEADD(MINUTE, 30, DATEADD(HOUR, 4, @CheckInTime)), 30, 1, @CheckInTime);
            END
            
            FETCH NEXT FROM user_cursor INTO @UserId, @EmployeeId;
        END
        
        CLOSE user_cursor;
        DEALLOCATE user_cursor;
        
        DELETE FROM @Users;
    END
    
    SET @CurrentDate = DATEADD(DAY, 1, @CurrentDate);
END

PRINT 'Sample attendance records inserted.';
GO

-- Insert sample approval requests
IF NOT EXISTS (SELECT 1 FROM ApprovalRequests)
BEGIN
    DECLARE @SampleUsers TABLE (UserId UNIQUEIDENTIFIER);
    INSERT INTO @SampleUsers SELECT TOP 3 Id FROM Users WHERE Role = 'employee' AND IsActive = 1;
    
    DECLARE @SampleUserId UNIQUEIDENTIFIER;
    DECLARE sample_cursor CURSOR FOR SELECT UserId FROM @SampleUsers;
    OPEN sample_cursor;
    FETCH NEXT FROM sample_cursor INTO @SampleUserId;
    
    WHILE @@FETCH_STATUS = 0
    BEGIN
        -- Insert a pending late approval
        INSERT INTO ApprovalRequests (Id, UserId, Type, Reason, Status, RequestedAt)
        VALUES (NEWID(), @SampleUserId, 'late', 'Traffic jam due to road construction', 'pending', DATEADD(HOUR, -2, GETUTCDATE()));
        
        -- Insert an approved break request
        INSERT INTO ApprovalRequests (Id, UserId, Type, Reason, Status, RequestedAt, ApprovedBy, ApprovedAt)
        VALUES (NEWID(), @SampleUserId, 'break', 'Medical appointment', 'approved', DATEADD(DAY, -1, GETUTCDATE()), 'John Manager', DATEADD(HOUR, -1, GETUTCDATE()));
        
        FETCH NEXT FROM sample_cursor INTO @SampleUserId;
    END
    
    CLOSE sample_cursor;
    DEALLOCATE sample_cursor;
    
    PRINT 'Sample approval requests inserted.';
END
GO

PRINT 'Sample data seeding completed successfully!';