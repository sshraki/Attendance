import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Clock, Users, AlertTriangle } from 'lucide-react';
import { storageService } from '../services/storage';
import { Settings as SettingsType } from '../types';

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<SettingsType>({
    maxBreakTime: 60,
    maxLateTime: 15,
    maxOvertime: 120,
    minCheckInTime: '08:00',
    maxCheckInTime: '10:00',
    minCheckOutTime: '16:00',
    maxCheckOutTime: '20:00',
    workingHoursPerDay: 8
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    const storedSettings = storageService.getSettings();
    setSettings(storedSettings);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.saveSettings(settings);
    setMessage('Settings saved successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <SettingsIcon className="mr-3 h-6 w-6" />
          System Settings
        </h2>

        {message && (
          <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Time Limits Section */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Time Limits
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Break Time (minutes)
                </label>
                <input
                  type="number"
                  name="maxBreakTime"
                  value={settings.maxBreakTime}
                  onChange={handleInputChange}
                  min="15"
                  max="180"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Breaks exceeding this limit require approval
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Late Time (minutes)
                </label>
                <input
                  type="number"
                  name="maxLateTime"
                  value={settings.maxLateTime}
                  onChange={handleInputChange}
                  min="5"
                  max="60"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Late arrivals exceeding this require reason
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Overtime (minutes)
                </label>
                <input
                  type="number"
                  name="maxOvertime"
                  value={settings.maxOvertime}
                  onChange={handleInputChange}
                  min="30"
                  max="240"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum allowed overtime per day
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Working Hours per Day
                </label>
                <input
                  type="number"
                  name="workingHoursPerDay"
                  value={settings.workingHoursPerDay}
                  onChange={handleInputChange}
                  min="6"
                  max="12"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Standard working hours per day
                </p>
              </div>
            </div>
          </div>

          {/* Check-in Times Section */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Allowed Time Windows
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Check-in Time
                </label>
                <input
                  type="time"
                  name="minCheckInTime"
                  value={settings.minCheckInTime}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Earliest allowed check-in time
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Check-in Time
                </label>
                <input
                  type="time"
                  name="maxCheckInTime"
                  value={settings.maxCheckInTime}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Latest allowed check-in time
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Check-out Time
                </label>
                <input
                  type="time"
                  name="minCheckOutTime"
                  value={settings.minCheckOutTime}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Earliest allowed check-out time
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Check-out Time
                </label>
                <input
                  type="time"
                  name="maxCheckOutTime"
                  value={settings.maxCheckOutTime}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Latest allowed check-out time
                </p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 mr-2" />
              <div className="text-sm text-amber-700">
                <p className="font-medium">Important Notes:</p>
                <ul className="mt-1 list-disc list-inside space-y-1">
                  <li>Changes to time limits affect all future attendance records</li>
                  <li>Existing pending approvals remain unaffected</li>
                  <li>Employees will be notified of policy changes automatically</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};