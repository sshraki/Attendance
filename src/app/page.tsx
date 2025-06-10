'use client';

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  UserCheck, 
  UserPlus, 
  Users, 
  Settings as SettingsIcon, 
  BarChart3, 
  CheckCircle2,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Dashboard } from '@/components/Dashboard';
import { AttendanceTracker } from '@/components/AttendanceTracker';
import { EmployeeRegistration } from '@/components/EmployeeRegistration';
import { UserManagement } from '@/components/UserManagement';
import { Settings } from '@/components/Settings';
import { Reports } from '@/components/Reports';
import { ApprovalManagement } from '@/components/ApprovalManagement';
import { apiService } from '@/services/api';
import { User } from '@/types';

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Check for existing session
      const user = await apiService.getCurrentUser();
      if (user) {
        setCurrentUser(user);
      } else {
        // For demo purposes, create a default admin user
        const adminUser = await apiService.createDefaultAdmin();
        setCurrentUser(adminUser);
      }
    } catch (error) {
      console.error('Failed to initialize app:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'manager', 'employee'] },
    { id: 'attendance', name: 'Attendance', icon: UserCheck, roles: ['admin', 'manager', 'employee'] },
    { id: 'registration', name: 'Register Employee', icon: UserPlus, roles: ['admin'] },
    { id: 'users', name: 'User Management', icon: Users, roles: ['admin'] },
    { id: 'approvals', name: 'Approvals', icon: CheckCircle2, roles: ['admin', 'manager'] },
    { id: 'reports', name: 'Reports', icon: BarChart3, roles: ['admin', 'manager'] },
    { id: 'settings', name: 'Settings', icon: SettingsIcon, roles: ['admin'] },
  ];

  const filteredNavigation = navigation.filter(item => 
    currentUser && item.roles.includes(currentUser.role)
  );

  const handleLogout = async () => {
    try {
      await apiService.logout();
      setCurrentUser(null);
      setActiveTab('dashboard');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'attendance': return <AttendanceTracker />;
      case 'registration': return <EmployeeRegistration />;
      case 'users': return <UserManagement />;
      case 'approvals': return <ApprovalManagement />;
      case 'reports': return <Reports />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading AttendancePro...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-25\" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">AttendancePro</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-8">
          <ul className="space-y-2 px-4">
            {filteredNavigation.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-2 text-left rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* User info and logout */}
        {currentUser && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {currentUser.name.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {currentUser.name}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {currentUser.role}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top navigation */}
        <header className="bg-white shadow-sm border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-semibold text-gray-800">AttendancePro</h1>
            <div className="w-6" /> {/* Spacer */}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {renderActiveComponent()}
        </main>
      </div>
    </div>
  );
}