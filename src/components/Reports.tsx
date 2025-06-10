import React, { useState, useEffect } from 'react';
import { BarChart3, Calendar, Clock, Users, Download, Filter } from 'lucide-react';
import { storageService } from '../services/storage';
import { AttendanceRecord, User } from '../types';

export const Reports: React.FC = () => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [reportType, setReportType] = useState<'attendance' | 'workHours' | 'leaves'>('attendance');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const records = storageService.getAttendanceRecords();
    const allUsers = storageService.getUsers();
    setAttendanceRecords(records);
    setUsers(allUsers);
  };

  const filteredRecords = attendanceRecords.filter(record => {
    const recordDate = new Date(record.date);
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    
    const inDateRange = recordDate >= startDate && recordDate <= endDate;
    const matchesUser = selectedUser === 'all' || record.employeeId === selectedUser;
    
    return inDateRange && matchesUser;
  });

  const generateAttendanceReport = () => {
    const report = filteredRecords.map(record => {
      const user = users.find(u => u.employeeId === record.employeeId);
      return {
        date: record.date,
        employeeId: record.employeeId,
        employeeName: user?.name || 'Unknown',
        department: user?.department || 'Unknown',
        checkIn: record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : 'N/A',
        checkOut: record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : 'N/A',
        status: record.status,
        isLate: record.isLate,
        totalBreaks: record.breaks.length,
        breakTime: record.totalBreakTime,
        workHours: record.totalWorkHours
      };
    });
    return report;
  };

  const generateWorkHoursReport = () => {
    const userStats = new Map();
    
    filteredRecords.forEach(record => {
      const user = users.find(u => u.employeeId === record.employeeId);
      if (!user) return;
      
      if (!userStats.has(record.employeeId)) {
        userStats.set(record.employeeId, {
          employeeId: record.employeeId,
          employeeName: user.name,
          department: user.department,
          totalDays: 0,
          totalWorkHours: 0,
          totalBreakTime: 0,
          lateDays: 0,
          averageWorkHours: 0
        });
      }
      
      const stats = userStats.get(record.employeeId);
      stats.totalDays++;
      stats.totalWorkHours += record.totalWorkHours;
      stats.totalBreakTime += record.totalBreakTime;
      if (record.isLate) stats.lateDays++;
      stats.averageWorkHours = stats.totalWorkHours / stats.totalDays;
    });
    
    return Array.from(userStats.values());
  };

  const generateLeavesReport = () => {
    const approvalRequests = storageService.getApprovalRequests();
    const leavesData = approvalRequests
      .filter(req => {
        const reqDate = new Date(req.requestedAt);
        const startDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);
        return reqDate >= startDate && reqDate <= endDate &&
               (selectedUser === 'all' || req.employeeId === selectedUser);
      })
      .map(req => {
        const user = users.find(u => u.employeeId === req.employeeId);
        return {
          date: new Date(req.requestedAt).toLocaleDateString(),
          employeeId: req.employeeId,
          employeeName: user?.name || 'Unknown',
          type: req.type,
          reason: req.reason,
          status: req.status,
          approvedBy: req.approvedBy || 'N/A',
          approvedAt: req.approvedAt ? new Date(req.approvedAt).toLocaleDateString() : 'N/A'
        };
      });
    
    return leavesData;
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => row[header]).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const renderReport = () => {
    switch (reportType) {
      case 'attendance':
        const attendanceData = generateAttendanceReport();
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Work Hours</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendanceData.map((record, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{record.employeeName}</div>
                      <div className="text-sm text-gray-500">{record.employeeId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.checkIn}
                      {record.isLate && <span className="ml-2 text-red-500">Late</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.checkOut}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        record.status === 'present' ? 'bg-green-100 text-green-800' :
                        record.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.workHours}h</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => exportToCSV(attendanceData, 'attendance_report')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </button>
            </div>
          </div>
        );

      case 'workHours':
        const workHoursData = generateWorkHoursReport();
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Days</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Hours</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Hours/Day</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Late Days</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {workHoursData.map((record, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{record.employeeName}</div>
                      <div className="text-sm text-gray-500">{record.employeeId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.department}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.totalDays}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.totalWorkHours.toFixed(1)}h</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.averageWorkHours.toFixed(1)}h</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.lateDays}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => exportToCSV(workHoursData, 'work_hours_report')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </button>
            </div>
          </div>
        );

      case 'leaves':
        const leavesData = generateLeavesReport();
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approved By</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leavesData.map((record, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{record.employeeName}</div>
                      <div className="text-sm text-gray-500">{record.employeeId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">{record.type}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{record.reason}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        record.status === 'approved' ? 'bg-green-100 text-green-800' :
                        record.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.approvedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => exportToCSV(leavesData, 'leaves_report')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <BarChart3 className="mr-3 h-6 w-6" />
          Reports & Analytics
        </h2>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="attendance">Attendance</option>
              <option value="workHours">Work Hours</option>
              <option value="leaves">Leaves & Approvals</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Employee</label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Employees</option>
              {users.map(user => (
                <option key={user.id} value={user.employeeId}>
                  {user.name} ({user.employeeId})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Report Content */}
        <div className="bg-gray-50 rounded-lg p-6">
          {renderReport()}
        </div>
      </div>
    </div>
  );
};