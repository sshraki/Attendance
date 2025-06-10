import axios from 'axios';
import { User, AttendanceRecord, Settings, ApprovalRequest } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7001/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export class ApiService {
  // Authentication
  async login(employeeId: string, password: string): Promise<User> {
    const response = await apiClient.post('/auth/login', { employeeId, password });
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
    }
    return response.data.user;
  }

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
    localStorage.removeItem('authToken');
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data;
    } catch (error) {
      return null;
    }
  }

  async createDefaultAdmin(): Promise<User> {
    const response = await apiClient.post('/auth/create-default-admin');
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
    }
    return response.data.user;
  }

  // Users
  async getUsers(): Promise<User[]> {
    const response = await apiClient.get('/users');
    return response.data;
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const response = await apiClient.post('/users', userData);
    return response.data;
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const response = await apiClient.put(`/users/${id}`, userData);
    return response.data;
  }

  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  }

  async getUserByEmployeeId(employeeId: string): Promise<User | null> {
    try {
      const response = await apiClient.get(`/users/employee/${employeeId}`);
      return response.data;
    } catch (error) {
      return null;
    }
  }

  // Attendance
  async getAttendanceRecords(startDate?: string, endDate?: string, employeeId?: string): Promise<AttendanceRecord[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (employeeId) params.append('employeeId', employeeId);
    
    const response = await apiClient.get(`/attendance?${params.toString()}`);
    return response.data;
  }

  async createAttendanceRecord(record: Omit<AttendanceRecord, 'id'>): Promise<AttendanceRecord> {
    const response = await apiClient.post('/attendance', record);
    return response.data;
  }

  async updateAttendanceRecord(id: string, record: Partial<AttendanceRecord>): Promise<AttendanceRecord> {
    const response = await apiClient.put(`/attendance/${id}`, record);
    return response.data;
  }

  async getTodayAttendance(employeeId: string): Promise<AttendanceRecord | null> {
    try {
      const response = await apiClient.get(`/attendance/today/${employeeId}`);
      return response.data;
    } catch (error) {
      return null;
    }
  }

  async checkIn(employeeId: string, faceData?: string): Promise<AttendanceRecord> {
    const response = await apiClient.post('/attendance/checkin', { employeeId, faceData });
    return response.data;
  }

  async checkOut(employeeId: string, reason?: string, type?: string): Promise<AttendanceRecord> {
    const response = await apiClient.post('/attendance/checkout', { employeeId, reason, type });
    return response.data;
  }

  async startBreak(employeeId: string): Promise<AttendanceRecord> {
    const response = await apiClient.post('/attendance/break/start', { employeeId });
    return response.data;
  }

  async endBreak(employeeId: string): Promise<AttendanceRecord> {
    const response = await apiClient.post('/attendance/break/end', { employeeId });
    return response.data;
  }

  // Face Recognition
  async registerFace(employeeId: string, faceData: string): Promise<void> {
    await apiClient.post('/face/register', { employeeId, faceData });
  }

  async recognizeFace(faceData: string): Promise<string | null> {
    try {
      const response = await apiClient.post('/face/recognize', { faceData });
      return response.data.employeeId;
    } catch (error) {
      return null;
    }
  }

  // Approval Requests
  async getApprovalRequests(): Promise<ApprovalRequest[]> {
    const response = await apiClient.get('/approvals');
    return response.data;
  }

  async createApprovalRequest(request: Omit<ApprovalRequest, 'id' | 'requestedAt'>): Promise<ApprovalRequest> {
    const response = await apiClient.post('/approvals', request);
    return response.data;
  }

  async updateApprovalRequest(id: string, status: 'approved' | 'rejected', approvedBy: string): Promise<ApprovalRequest> {
    const response = await apiClient.put(`/approvals/${id}`, { status, approvedBy });
    return response.data;
  }

  // Settings
  async getSettings(): Promise<Settings> {
    const response = await apiClient.get('/settings');
    return response.data;
  }

  async updateSettings(settings: Settings): Promise<Settings> {
    const response = await apiClient.put('/settings', settings);
    return response.data;
  }

  // Reports
  async getAttendanceReport(startDate: string, endDate: string, employeeId?: string): Promise<any[]> {
    const params = new URLSearchParams();
    params.append('startDate', startDate);
    params.append('endDate', endDate);
    if (employeeId) params.append('employeeId', employeeId);
    
    const response = await apiClient.get(`/reports/attendance?${params.toString()}`);
    return response.data;
  }

  async getWorkHoursReport(startDate: string, endDate: string, employeeId?: string): Promise<any[]> {
    const params = new URLSearchParams();
    params.append('startDate', startDate);
    params.append('endDate', endDate);
    if (employeeId) params.append('employeeId', employeeId);
    
    const response = await apiClient.get(`/reports/workhours?${params.toString()}`);
    return response.data;
  }

  async getLeavesReport(startDate: string, endDate: string, employeeId?: string): Promise<any[]> {
    const params = new URLSearchParams();
    params.append('startDate', startDate);
    params.append('endDate', endDate);
    if (employeeId) params.append('employeeId', employeeId);
    
    const response = await apiClient.get(`/reports/leaves?${params.toString()}`);
    return response.data;
  }

  // Dashboard Stats
  async getDashboardStats(): Promise<any> {
    const response = await apiClient.get('/dashboard/stats');
    return response.data;
  }
}

export const apiService = new ApiService();