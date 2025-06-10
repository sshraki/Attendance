import { User, AttendanceRecord, Settings, ApprovalRequest } from '../types';

class StorageService {
  // Users
  getUsers(): User[] {
    const stored = localStorage.getItem('users');
    return stored ? JSON.parse(stored) : [];
  }

  saveUser(user: User): void {
    const users = this.getUsers();
    const existingIndex = users.findIndex(u => u.id === user.id);
    
    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    
    localStorage.setItem('users', JSON.stringify(users));
  }

  getUserByEmployeeId(employeeId: string): User | null {
    const users = this.getUsers();
    return users.find(u => u.employeeId === employeeId) || null;
  }

  // Attendance Records
  getAttendanceRecords(): AttendanceRecord[] {
    const stored = localStorage.getItem('attendanceRecords');
    return stored ? JSON.parse(stored) : [];
  }

  saveAttendanceRecord(record: AttendanceRecord): void {
    const records = this.getAttendanceRecords();
    const existingIndex = records.findIndex(r => r.id === record.id);
    
    if (existingIndex >= 0) {
      records[existingIndex] = record;
    } else {
      records.push(record);
    }
    
    localStorage.setItem('attendanceRecords', JSON.stringify(records));
  }

  getTodayAttendance(employeeId: string): AttendanceRecord | null {
    const today = new Date().toISOString().split('T')[0];
    const records = this.getAttendanceRecords();
    return records.find(r => r.employeeId === employeeId && r.date === today) || null;
  }

  // Settings
  getSettings(): Settings {
    const stored = localStorage.getItem('settings');
    return stored ? JSON.parse(stored) : {
      maxBreakTime: 60, // 1 hour
      maxLateTime: 15, // 15 minutes
      maxOvertime: 120, // 2 hours
      minCheckInTime: '08:00',
      maxCheckInTime: '10:00',
      minCheckOutTime: '16:00',
      maxCheckOutTime: '20:00',
      workingHoursPerDay: 8
    };
  }

  saveSettings(settings: Settings): void {
    localStorage.setItem('settings', JSON.stringify(settings));
  }

  // Approval Requests
  getApprovalRequests(): ApprovalRequest[] {
    const stored = localStorage.getItem('approvalRequests');
    return stored ? JSON.parse(stored) : [];
  }

  saveApprovalRequest(request: ApprovalRequest): void {
    const requests = this.getApprovalRequests();
    const existingIndex = requests.findIndex(r => r.id === request.id);
    
    if (existingIndex >= 0) {
      requests[existingIndex] = request;
    } else {
      requests.push(request);
    }
    
    localStorage.setItem('approvalRequests', JSON.stringify(requests));
  }

  // Current User Session
  getCurrentUser(): User | null {
    const stored = localStorage.getItem('currentUser');
    return stored ? JSON.parse(stored) : null;
  }

  setCurrentUser(user: User): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  clearCurrentUser(): void {
    localStorage.removeItem('currentUser');
  }
}

export const storageService = new StorageService();