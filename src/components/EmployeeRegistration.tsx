'use client';

import React, { useState } from 'react';
import { UserPlus, Save } from 'lucide-react';
import { Camera } from './Camera';
import { faceRecognitionService } from '@/services/faceRecognition';
import { apiService } from '@/services/api';
import { User } from '@/types';

export const EmployeeRegistration: React.FC = () => {
  const [formData, setFormData] = useState({
    employeeId: '',
    name: '',
    email: '',
    department: '',
    role: 'employee' as 'employee' | 'manager' | 'admin',
    managerId: ''
  });
  const [capturedImage, setCapturedImage] = useState<string>('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [message, setMessage] = useState('');
  const [managers, setManagers] = useState<User[]>([]);

  React.useEffect(() => {
    loadManagers();
  }, []);

  const loadManagers = async () => {
    try {
      const users = await apiService.getUsers();
      setManagers(users.filter(user => user.role === 'manager'));
    } catch (error) {
      console.error('Failed to load managers:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageCapture = (imageDataUrl: string) => {
    setCapturedImage(imageDataUrl);
    setMessage('Photo captured successfully!');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!capturedImage) {
      setMessage('Please capture a photo first.');
      return;
    }

    setIsRegistering(true);
    setMessage('Registering employee...');

    try {
      // Create image element for face recognition
      const img = new Image();
      img.onload = async () => {
        try {
          // Register face
          const faceDescriptor = await faceRecognitionService.registerFace(formData.employeeId, img);
          
          if (!faceDescriptor) {
            setMessage('Face detection failed. Please try again with a clearer photo.');
            setIsRegistering(false);
            return;
          }

          // Create user record
          const newUser = await apiService.createUser({
            employeeId: formData.employeeId,
            name: formData.name,
            email: formData.email,
            role: formData.role,
            department: formData.department,
            managerId: formData.managerId || undefined,
            faceDescriptor,
            isActive: true
          });

          setMessage('Employee registered successfully!');
          
          // Reset form
          setFormData({
            employeeId: '',
            name: '',
            email: '',
            department: '',
            role: 'employee',
            managerId: ''
          });
          setCapturedImage('');
          
        } catch (error) {
          console.error('Registration error:', error);
          setMessage('Registration failed. Please try again.');
        } finally {
          setIsRegistering(false);
        }
      };
      
      img.src = capturedImage;
    } catch (error) {
      console.error('Registration error:', error);
      setMessage('Registration failed. Please try again.');
      setIsRegistering(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <UserPlus className="mr-3 h-6 w-6" />
          Employee Registration
        </h2>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('successfully') ? 'bg-green-100 text-green-700' : 
            message.includes('failed') ? 'bg-red-100 text-red-700' : 
            'bg-blue-100 text-blue-700'
          }`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee ID *
                </label>
                <input
                  type="text"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="EMP001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="john.doe@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department *
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="IT Department"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {formData.role === 'employee' && managers.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Manager
                  </label>
                  <select
                    name="managerId"
                    value={formData.managerId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Manager</option>
                    {managers.map(manager => (
                      <option key={manager.id} value={manager.id}>
                        {manager.name} ({manager.employeeId})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                type="submit"
                disabled={isRegistering || !capturedImage}
                className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                <Save className="mr-2 h-4 w-4" />
                {isRegistering ? 'Registering...' : 'Register Employee'}
              </button>
            </form>
          </div>

          {/* Camera Section */}
          <div>
            <Camera
              isRegistration={true}
              onImageCapture={handleImageCapture}
            />
            
            {capturedImage && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Captured Photo:</h4>
                <img
                  src={capturedImage}
                  alt="Captured"
                  className="w-full h-32 object-cover rounded-lg border-2 border-green-500"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};