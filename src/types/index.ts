export interface User {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  role: 'employee' | 'manager' | 'admin';
  department: string;
  managerId?: string;
  faceDescriptor?: Float32Array;
  createdAt: Date;
  isActive: boolean;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  checkIn?: Date;
  checkOut?: Date;
  breaks: BreakRecord[];
  totalWorkHours: number;
  totalBreakTime: number;
  isLate: boolean;
  lateReason?: string;
  lateApproved: boolean;
  reasonableCheckout?: ReasonableCheckout;
  status: 'present' | 'absent' | 'partial';
}

export interface BreakRecord {
  id: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  reason?: string;
  approved: boolean;
}

export interface ReasonableCheckout {
  reason: string;
  type: 'work' | 'sick' | 'personal' | 'emergency';
  approved: boolean;
  approvedBy?: string;
  requestedAt: Date;
}

export interface Settings {
  maxBreakTime: number; // minutes
  maxLateTime: number; // minutes
  maxOvertime: number; // minutes
  minCheckInTime: string; // HH:mm
  maxCheckInTime: string; // HH:mm
  minCheckOutTime: string; // HH:mm
  maxCheckOutTime: string; // HH:mm
  workingHoursPerDay: number;
}

export interface FaceData {
  employeeId: string;
  descriptor: Float32Array;
  imageUrl: string;
}

export interface ApprovalRequest {
  id: string;
  employeeId: string;
  type: 'late' | 'break' | 'checkout';
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
}