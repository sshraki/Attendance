'use client';

import React, { useState, useEffect } from 'react';
import { Clock, LogIn, LogOut, Coffee, AlertCircle } from 'lucide-react';
import { Camera } from './Camera';
import { ReasonModal } from './ReasonModal';
import { apiService } from '@/services/api';
import { AttendanceRecord, User, ApprovalRequest } from '@/types';

export const AttendanceTracker: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [reasonType, setReasonType] = useState<'late' | 'break' | 'checkout'>('late');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await apiService.getCurrentUser();
      if (user) {
        setCurrentUser(user);
        await loadTodayRecord(user.employeeId);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTodayRecord = async (employeeId: string) => {
    try {
      const record = await apiService.getTodayAttendance(employeeId);
      setTodayRecord(record);
    } catch (error) {
      console.error('Failed to load today record:', error);
    }
  };

  const handleFaceDetected = async (employeeId: string) => {
    try {
      const user = await apiService.getUserByEmployeeId(employeeId);
      if (!user) {
        setMessage('Employee not found. Please register first.');
        return;
      }

      setCurrentUser(user);
      await processAttendance(user);
    } catch (error) {
      console.error('Face detection error:', error);
      setMessage('Face recognition failed. Please try again.');
    }
  };

  const processAttendance = async (user: User) => {
    try {
      const now = new Date();
      let record = await apiService.getTodayAttendance(user.employeeId);

      if (!record) {
        // First check-in of the day
        record = await apiService.checkIn(user.employeeId);
        
        if (record.isLate) {
          setReasonType('late');
          setShowReasonModal(true);
        } else {
          setMessage(`Good morning, ${user.name}! You've checked in at ${now.toLocaleTimeString()}`);
        }
      } else if (!record.checkOut) {
        // Subsequent actions - break or checkout
        const lastBreak = record.breaks[record.breaks.length - 1];
        
        if (lastBreak && !lastBreak.endTime) {
          // End break
          record = await apiService.endBreak(user.employeeId);
          setMessage(`Break ended. Duration: ${lastBreak.duration} minutes`);
        } else {
          // Determine if this should be checkout or break
          const currentTime = now.getHours() * 60 + now.getMinutes();
          const settings = await apiService.getSettings();
          const minCheckoutTime = timeStringToMinutes(settings.minCheckOutTime);
          
          if (currentTime >= minCheckoutTime) {
            // This is likely a checkout
            setReasonType('checkout');
            setShowReasonModal(true);
          } else {
            // Start new break
            record = await apiService.startBreak(user.employeeId);
            setMessage(`Break started at ${now.toLocaleTimeString()}`);
          }
        }
      } else {
        setMessage('You have already checked out for today.');
        return;
      }

      setTodayRecord(record);
    } catch (error) {
      console.error('Attendance processing error:', error);
      setMessage('Failed to process attendance. Please try again.');
    }
  };

  const handleReasonSubmit = async (reason: string, type?: string) => {
    if (!currentUser) return;

    try {
      if (reasonType === 'late' || reasonType === 'break') {
        await apiService.createApprovalRequest({
          employeeId: currentUser.employeeId,
          type: reasonType,
          reason,
          status: 'pending'
        });
        setMessage(`${reasonType === 'late' ? 'Late arrival' : 'Extended break'} reason submitted. Waiting for approval.`);
      } else if (reasonType === 'checkout') {
        const record = await apiService.checkOut(currentUser.employeeId, reason, type);
        await apiService.createApprovalRequest({
          employeeId: currentUser.employeeId,
          type: 'checkout',
          reason: `${type}: ${reason}`,
          status: 'pending'
        });
        setTodayRecord(record);
        setMessage(`Checked out at ${new Date().toLocaleTimeString()}. Reason submitted for approval.`);
      }

      setShowReasonModal(false);
      await loadTodayRecord(currentUser.employeeId);
    } catch (error) {
      console.error('Failed to submit reason:', error);
      setMessage('Failed to submit reason. Please try again.');
    }
  };

  const timeStringToMinutes = (timeString: string): number => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const getAttendanceStatus = () => {
    if (!todayRecord) return 'Not checked in';
    if (!todayRecord.checkOut) {
      const lastBreak = todayRecord.breaks[todayRecord.breaks.length - 1];
      if (lastBreak && !lastBreak.endTime) {
        return 'On break';
      }
      return 'Checked in';
    }
    return 'Checked out';
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
              <div className="h-80 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <Clock className="mr-3 h-6 w-6" />
          Attendance Tracker
        </h2>

        {message && (
          <div className="mb-6 p-4 bg-blue-100 text-blue-700 rounded-lg">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Status Section */}
          <div className="space-y-6">
            {currentUser && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Status</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Employee:</span> {currentUser.name} ({currentUser.employeeId})</p>
                  <p><span className="font-medium">Status:</span> 
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                      getAttendanceStatus() === 'Checked in' ? 'bg-green-100 text-green-700' :
                      getAttendanceStatus() === 'On break' ? 'bg-yellow-100 text-yellow-700' :
                      getAttendanceStatus() === 'Checked out' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {getAttendanceStatus()}
                    </span>
                  </p>
                  {todayRecord && (
                    <>
                      {todayRecord.checkIn && (
                        <p><span className="font-medium">Check In:</span> {new Date(todayRecord.checkIn).toLocaleTimeString()}</p>
                      )}
                      {todayRecord.checkOut && (
                        <p><span className="font-medium">Check Out:</span> {new Date(todayRecord.checkOut).toLocaleTimeString()}</p>
                      )}
                      <p><span className="font-medium">Total Breaks:</span> {todayRecord.breaks.length}</p>
                      <p><span className="font-medium">Break Time:</span> {todayRecord.totalBreakTime} minutes</p>
                      {todayRecord.isLate && (
                        <div className="flex items-center text-amber-600">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          <span className="text-sm">Late arrival - {todayRecord.lateApproved ? 'Approved' : 'Pending approval'}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {todayRecord && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-md font-semibold text-gray-800 mb-3">Today's Activity</h4>
                <div className="space-y-2 text-sm">
                  {todayRecord.checkIn && (
                    <div className="flex items-center">
                      <LogIn className="h-4 w-4 mr-2 text-green-600" />
                      <span>Checked in at {new Date(todayRecord.checkIn).toLocaleTimeString()}</span>
                    </div>
                  )}
                  {todayRecord.breaks.map((br, index) => (
                    <div key={br.id}>
                      <div className="flex items-center">
                        <Coffee className="h-4 w-4 mr-2 text-yellow-600" />
                        <span>Break {index + 1}: {new Date(br.startTime).toLocaleTimeString()}</span>
                        {br.endTime && <span> - {new Date(br.endTime).toLocaleTimeString()} ({br.duration}m)</span>}
                      </div>
                    </div>
                  ))}
                  {todayRecord.checkOut && (
                    <div className="flex items-center">
                      <LogOut className="h-4 w-4 mr-2 text-blue-600" />
                      <span>Checked out at {new Date(todayRecord.checkOut).toLocaleTimeString()}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Camera Section */}
          <div>
            <Camera onFaceDetected={handleFaceDetected} />
          </div>
        </div>

        {showReasonModal && (
          <ReasonModal
            type={reasonType}
            onSubmit={handleReasonSubmit}
            onClose={() => setShowReasonModal(false)}
          />
        )}
      </div>
    </div>
  );
};