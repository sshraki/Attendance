import React, { useState, useEffect } from 'react';
import { Clock, LogIn, LogOut, Coffee, AlertCircle } from 'lucide-react';
import { Camera } from './Camera';
import { ReasonModal } from './ReasonModal';
import { storageService } from '../services/storage';
import { AttendanceRecord, User, ApprovalRequest } from '../types';

export const AttendanceTracker: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [reasonType, setReasonType] = useState<'late' | 'break' | 'checkout'>('late');
  const [message, setMessage] = useState('');
  const [lastAction, setLastAction] = useState<string>('');

  useEffect(() => {
    const user = storageService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      loadTodayRecord(user.employeeId);
    }
  }, []);

  const loadTodayRecord = (employeeId: string) => {
    const record = storageService.getTodayAttendance(employeeId);
    setTodayRecord(record);
  };

  const handleFaceDetected = async (employeeId: string) => {
    const user = storageService.getUserByEmployeeId(employeeId);
    if (!user) {
      setMessage('Employee not found. Please register first.');
      return;
    }

    setCurrentUser(user);
    storageService.setCurrentUser(user);
    
    await processAttendance(user);
  };

  const processAttendance = async (user: User) => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    let record = storageService.getTodayAttendance(user.employeeId);
    const settings = storageService.getSettings();

    if (!record) {
      // First check-in of the day
      const isLate = isLateArrival(now, settings.minCheckInTime, settings.maxLateTime);
      
      record = {
        id: crypto.randomUUID(),
        employeeId: user.employeeId,
        date: today,
        checkIn: now,
        breaks: [],
        totalWorkHours: 0,
        totalBreakTime: 0,
        isLate,
        lateApproved: !isLate,
        status: 'present'
      };

      if (isLate) {
        setReasonType('late');
        setShowReasonModal(true);
        setLastAction('checkin-late');
      } else {
        setMessage(`Good morning, ${user.name}! You've checked in at ${now.toLocaleTimeString()}`);
        setLastAction('checkin');
      }
    } else if (!record.checkOut) {
      // Subsequent actions - break or checkout
      const lastBreak = record.breaks[record.breaks.length - 1];
      
      if (lastBreak && !lastBreak.endTime) {
        // End break
        lastBreak.endTime = now;
        lastBreak.duration = Math.floor((now.getTime() - lastBreak.startTime.getTime()) / (1000 * 60));
        
        // Check if break exceeded limit
        const totalBreakTime = record.breaks.reduce((total, br) => total + br.duration, 0);
        if (totalBreakTime > settings.maxBreakTime) {
          setReasonType('break');
          setShowReasonModal(true);
          setLastAction('break-end-long');
        } else {
          setMessage(`Break ended. Duration: ${lastBreak.duration} minutes`);
          setLastAction('break-end');
        }
      } else {
        // Determine if this should be checkout or break
        const currentTime = now.getHours() * 60 + now.getMinutes();
        const minCheckoutTime = timeStringToMinutes(settings.minCheckOutTime);
        
        if (currentTime >= minCheckoutTime) {
          // This is likely a checkout
          setReasonType('checkout');
          setShowReasonModal(true);
          setLastAction('checkout');
        } else {
          // Start new break
          record.breaks.push({
            id: crypto.randomUUID(),
            startTime: now,
            duration: 0,
            approved: true
          });
          setMessage(`Break started at ${now.toLocaleTimeString()}`);
          setLastAction('break-start');
        }
      }
    } else {
      setMessage('You have already checked out for today.');
      return;
    }

    storageService.saveAttendanceRecord(record);
    setTodayRecord(record);
  };

  const handleReasonSubmit = (reason: string, type?: string) => {
    if (!currentUser || !todayRecord) return;

    const now = new Date();

    if (reasonType === 'late') {
      const request: ApprovalRequest = {
        id: crypto.randomUUID(),
        employeeId: currentUser.employeeId,
        type: 'late',
        reason,
        status: 'pending',
        requestedAt: now
      };
      
      storageService.saveApprovalRequest(request);
      setMessage(`Late arrival reason submitted. Waiting for approval. Checked in at ${now.toLocaleTimeString()}`);
      
    } else if (reasonType === 'break') {
      const request: ApprovalRequest = {
        id: crypto.randomUUID(),
        employeeId: currentUser.employeeId,
        type: 'break',
        reason,
        status: 'pending',
        requestedAt: now
      };
      
      storageService.saveApprovalRequest(request);
      setMessage('Extended break reason submitted. Waiting for approval.');
      
    } else if (reasonType === 'checkout') {
      todayRecord.checkOut = now;
      todayRecord.reasonableCheckout = {
        reason,
        type: (type as any) || 'work',
        approved: false,
        requestedAt: now
      };
      
      // Calculate work hours
      if (todayRecord.checkIn) {
        const workTime = now.getTime() - todayRecord.checkIn.getTime();
        const breakTime = todayRecord.breaks.reduce((total, br) => total + (br.duration * 60 * 1000), 0);
        todayRecord.totalWorkHours = Math.floor((workTime - breakTime) / (1000 * 60 * 60));
        todayRecord.totalBreakTime = Math.floor(breakTime / (1000 * 60));
      }
      
      const request: ApprovalRequest = {
        id: crypto.randomUUID(),
        employeeId: currentUser.employeeId,
        type: 'checkout',
        reason: `${type}: ${reason}`,
        status: 'pending',
        requestedAt: now
      };
      
      storageService.saveApprovalRequest(request);
      storageService.saveAttendanceRecord(todayRecord);
      setMessage(`Checked out at ${now.toLocaleTimeString()}. Reason submitted for approval.`);
    }

    setShowReasonModal(false);
    loadTodayRecord(currentUser.employeeId);
  };

  const isLateArrival = (checkInTime: Date, minTime: string, maxLateMinutes: number): boolean => {
    const checkInMinutes = checkInTime.getHours() * 60 + checkInTime.getMinutes();
    const minMinutes = timeStringToMinutes(minTime);
    return checkInMinutes > (minMinutes + maxLateMinutes);
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