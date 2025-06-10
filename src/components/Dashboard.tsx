import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Clock, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import { storageService } from '../services/storage';
import { AttendanceRecord, User, ApprovalRequest } from '../types';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    lateToday: 0,
    pendingApprovals: 0,
    avgWorkHours: 0,
    onBreak: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    const users = storageService.getUsers();
    const attendanceRecords = storageService.getAttendanceRecords();
    const approvalRequests = storageService.getApprovalRequests();
    const user = storageService.getCurrentUser();
    
    setCurrentUser(user);

    // Get today's date
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = attendanceRecords.filter(record => record.date === today);

    // Calculate stats
    const totalEmployees = users.filter(u => u.isActive).length;
    const presentToday = todayRecords.filter(record => record.status === 'present' || record.status === 'partial').length;
    const lateToday = todayRecords.filter(record => record.isLate).length;
    const onBreak = todayRecords.filter(record => {
      const lastBreak = record.breaks[record.breaks.length - 1];
      return lastBreak && !lastBreak.endTime;
    }).length;
    
    const pendingApprovals = approvalRequests.filter(req => {
      if (req.status !== 'pending') return false;
      
      // Filter by user role
      if (user?.role === 'manager') {
        const employee = users.find(u => u.employeeId === req.employeeId);
        return employee?.managerId === user.id;
      } else if (user?.role === 'admin') {
        return true;
      }
      return false;
    }).length;

    // Calculate average work hours for this week
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekStartStr = weekStart.toISOString().split('T')[0];
    
    const thisWeekRecords = attendanceRecords.filter(record => record.date >= weekStartStr);
    const totalWorkHours = thisWeekRecords.reduce((sum, record) => sum + record.totalWorkHours, 0);
    const avgWorkHours = thisWeekRecords.length > 0 ? totalWorkHours / thisWeekRecords.length : 0;

    setStats({
      totalEmployees,
      presentToday,
      lateToday,
      pendingApprovals,
      avgWorkHours: Math.round(avgWorkHours * 10) / 10,
      onBreak
    });

    // Generate recent activity
    const recent = [
      ...todayRecords.slice(-5).map(record => {
        const user = users.find(u => u.employeeId === record.employeeId);
        return {
          type: 'attendance',
          message: `${user?.name} checked ${record.checkOut ? 'out' : 'in'}`,
          time: record.checkOut ? new Date(record.checkOut) : new Date(record.checkIn!),
          user: user?.name
        };
      }),
      ...approvalRequests.filter(req => req.status === 'pending').slice(-3).map(req => {
        const user = users.find(u => u.employeeId === req.employeeId);
        return {
          type: 'approval',
          message: `${user?.name} requested ${req.type} approval`,
          time: new Date(req.requestedAt),
          user: user?.name
        };
      })
    ].sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 8);

    setRecentActivity(recent);
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    change?: string;
  }> = ({ title, value, icon, color, change }) => (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <p className="text-sm text-green-600 mt-1">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              {change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard
          {currentUser && (
            <span className="text-lg font-normal text-gray-600 ml-2">
              Welcome back, {currentUser.name}
            </span>
          )}
        </h1>
        <p className="text-gray-600 mt-1">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Employees"
          value={stats.totalEmployees}
          icon={<Users className="h-6 w-6 text-white" />}
          color="bg-blue-500"
        />
        
        <StatCard
          title="Present Today"
          value={stats.presentToday}
          icon={<CheckCircle className="h-6 w-6 text-white" />}
          color="bg-green-500"
          change={`${Math.round((stats.presentToday / stats.totalEmployees) * 100)}% attendance`}
        />
        
        <StatCard
          title="Late Arrivals"
          value={stats.lateToday}
          icon={<AlertTriangle className="h-6 w-6 text-white" />}
          color="bg-amber-500"
        />
        
        <StatCard
          title="On Break"
          value={stats.onBreak}
          icon={<Clock className="h-6 w-6 text-white" />}
          color="bg-purple-500"
        />
        
        <StatCard
          title="Pending Approvals"
          value={stats.pendingApprovals}
          icon={<AlertTriangle className="h-6 w-6 text-white" />}
          color="bg-red-500"
        />
        
        <StatCard
          title="Avg Work Hours"
          value={`${stats.avgWorkHours}h`}
          icon={<BarChart3 className="h-6 w-6 text-white" />}
          color="bg-indigo-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    activity.type === 'attendance' ? 'bg-green-100' : 'bg-amber-100'
                  }`}>
                    {activity.type === 'attendance' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">
                      {activity.time.toLocaleTimeString()} - {activity.time.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-3">
            {currentUser?.role === 'admin' && (
              <>
                <button className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-left">
                  <Users className="h-5 w-5 text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Manage Users</p>
                    <p className="text-sm text-gray-600">Add, edit, or remove employees</p>
                  </div>
                </button>
                
                <button className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-left">
                  <BarChart3 className="h-5 w-5 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">View Reports</p>
                    <p className="text-sm text-gray-600">Generate attendance and work hour reports</p>
                  </div>
                </button>
              </>
            )}
            
            {(currentUser?.role === 'manager' || currentUser?.role === 'admin') && stats.pendingApprovals > 0 && (
              <button className="flex items-center p-3 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors text-left">
                <AlertTriangle className="h-5 w-5 text-amber-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Pending Approvals</p>
                  <p className="text-sm text-gray-600">{stats.pendingApprovals} requests need your attention</p>
                </div>
              </button>
            )}
            
            <button className="flex items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-left">
              <Clock className="h-5 w-5 text-purple-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Track Attendance</p>
                <p className="text-sm text-gray-600">Check in/out using face recognition</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};