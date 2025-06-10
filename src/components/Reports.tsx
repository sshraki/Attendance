'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, Calendar, Clock, Users, Download, Filter } from 'lucide-react';
import { apiService } from '@/services/api';
import { User } from '@/types';

export const Reports: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [reportType, setReportType] = useState<'attendance' | 'workHours' | 'leaves'>('attendance');
  const [reportData, setReportData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    generateReport();
  }, [reportType, dateRange, selectedUser]);

  const loadUsers = async () => {
    try {
      const allUsers = await apiService.getUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      let data: any[] = [];
      
      switch (reportType) {
        case 'attendance':
          data = await apiService.getAttendanceReport(
            dateRange.startDate, 
            dateRange.endDate, 
            selectedUser === 'all' ? undefined : selectedUser
          );
          break;
        case 'workHours':
          data = await apiService.getWorkHoursReport(
            dateRange.startDate, 
            dateRange.endDate, 
            selectedUser === 'all' ? undefined : selectedUser
          );
          break;
        case 'leaves':
          data = await apiService.getLeavesReport(
            dateRange.startDate, 
            dateRange.endDate, 
            selectedUser === 'all' ? undefined : selectedUser
          );
          break;
      }
      
      setReportData(data);
    } catch (error) {
      console.error('Failed to generate report:', error);
      setReportData([]);
    } finally {
      setLoading(false);
    }
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

  const renderAttendanceReport = () => (
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
          {reportData.map((record, index) => (
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
    </div>
  );

  const renderWorkHoursReport = () => (
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
          {reportData.map((record, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{record.employeeName}</div>
                <div className="text-sm text-gray-500">{record.employeeId}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.department}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.totalDays}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.totalWorkHours?.toFixed(1)}h</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.averageWorkHours?.toFixed(1)}h</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.lateDays}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderLeavesReport = () => (
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
          {reportData.map((record, index) => (
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
    </div>
  );

  const renderReport = () => {
    if (loading) {
      return (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Generating report...</p>
        </div>
      );
    }

    switch (reportType) {
      case 'attendance': return renderAttendanceReport();
      case 'workHours': return renderWorkHoursReport();
      case 'leaves': return renderLeavesReport();
      default: return null;
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
          
          {!loading && reportData.length > 0 && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => exportToCSV(reportData, `${reportType}_report`)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </button>
            </div>
          )}
          
          {!loading && reportData.length === 0 && (
            <div className="text-center py-8">
              <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No data found</h3>
              <p className="mt-1 text-sm text-gray-500">
                No data available for the selected criteria.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};