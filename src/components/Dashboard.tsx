'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Clock, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import { apiService } from '@/services/api';
import { User } from '@/types';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [dashboardStats, user] = await Promise.all([
        apiService.getDashboardStats(),
        apiService.getCurrentUser()
      ]);
      
      setStats(dashboardStats);
      setCurrentUser(user);
      setRecentActivity(dashboardStats.recentActivity || []);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-lg p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

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
                      {new Date(activity.time).toLocaleTimeString()} - {new Date(activity.time).toLocaleDateString()}
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