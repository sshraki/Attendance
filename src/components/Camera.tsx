'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Camera as CameraIcon, Square, UserCheck, AlertCircle, Settings, RefreshCw } from 'lucide-react';
import { faceRecognitionService } from '@/services/faceRecognition';

interface CameraProps {
  onFaceDetected?: (employeeId: string) => void;
  onImageCapture?: (imageDataUrl: string) => void;
  isRegistration?: boolean;
}

export const Camera: React.FC<CameraProps> = ({
  onFaceDetected,
  onImageCapture,
  isRegistration = false
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [lastDetection, setLastDetection] = useState<string>('');
  const [cameraError, setCameraError] = useState<string>('');
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    initializeCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [selectedDevice]);

  useEffect(() => {
    if (!isRegistration && videoRef.current && isDetecting) {
      const interval = setInterval(async () => {
        await performFaceRecognition();
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isDetecting, isRegistration]);

  const checkCameraPermission = async (): Promise<boolean> => {
    try {
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
        return permission.state === 'granted';
      }
      return true;
    } catch (error) {
      console.warn('Permission API not available:', error);
      return true;
    }
  };

  const initializeCamera = async () => {
    try {
      setIsInitializing(true);
      setCameraError('');
      setPermissionDenied(false);

      const hasPermission = await checkCameraPermission();
      if (!hasPermission) {
        throw new Error('Camera permission not granted');
      }

      let videoDevices: MediaDeviceInfo[] = [];
      try {
        videoDevices = await faceRecognitionService.getVideoDevices();
        setDevices(videoDevices);
      } catch (deviceError) {
        console.warn('Could not enumerate devices:', deviceError);
      }

      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: selectedDevice || undefined,
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (error: any) {
      console.error('Camera initialization error:', error);
      
      if (error.name === 'NotAllowedError' || 
          error.name === 'SecurityError' || 
          error.message?.includes('Permission denied') ||
          error.message?.includes('permission')) {
        setPermissionDenied(true);
        setCameraError('Camera access denied. Please enable camera permissions to use this feature.');
      } else if (error.name === 'NotFoundError') {
        setCameraError('No camera found. Please connect a camera and try again.');
      } else if (error.name === 'NotReadableError') {
        setCameraError('Camera is already in use by another application. Please close other applications using the camera.');
      } else if (error.name === 'OverconstrainedError') {
        setCameraError('Camera constraints not supported. Trying with default settings...');
        setTimeout(() => {
          setSelectedDevice('');
        }, 1000);
      } else {
        setCameraError(`Camera error: ${error.message || 'Unable to access camera. Please check your browser settings.'}`);
      }
    } finally {
      setIsInitializing(false);
    }
  };

  const performFaceRecognition = async () => {
    if (!videoRef.current) return;

    try {
      const employeeId = await faceRecognitionService.recognizeFace(videoRef.current);
      if (employeeId && employeeId !== lastDetection) {
        setLastDetection(employeeId);
        onFaceDetected?.(employeeId);
      }
    } catch (error) {
      console.error('Face recognition error:', error);
    }
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    if (context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
      onImageCapture?.(imageDataUrl);
    }
  };

  const toggleDetection = () => {
    setIsDetecting(!isDetecting);
  };

  const retryCamera = () => {
    initializeCamera();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <CameraIcon className="mr-2 h-5 w-5" />
          Camera Feed
        </h3>
        
        {devices.length > 1 && !cameraError && !isInitializing && (
          <select
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Default Camera</option>
            {devices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
              </option>
            ))}
          </select>
        )}
      </div>

      {isInitializing ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <RefreshCw className="mx-auto h-8 w-8 text-blue-500 mb-3 animate-spin" />
          <p className="text-blue-700">Initializing camera...</p>
        </div>
      ) : cameraError ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h4 className="text-lg font-medium text-red-800 mb-2">Camera Access Required</h4>
          <p className="text-red-700 mb-4">{cameraError}</p>
          
          {permissionDenied && (
            <div className="bg-white rounded-md p-4 mb-4 text-left">
              <h5 className="font-medium text-gray-800 mb-2 flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                How to enable camera access:
              </h5>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Click the camera icon in your browser's address bar</li>
                <li>• Select "Allow" for camera permissions</li>
                <li>• Or go to browser Settings → Privacy & Security → Camera</li>
                <li>• Make sure your browser has camera access in system settings</li>
                <li>• Refresh the page after enabling permissions</li>
              </ul>
            </div>
          )}
          
          <button
            onClick={retryCamera}
            disabled={isInitializing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center mx-auto"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </button>
        </div>
      ) : (
        <>
          <div className="relative bg-gray-900 rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-80 object-cover"
            />
            
            {lastDetection && (
              <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                Detected: {lastDetection}
              </div>
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />

          <div className="flex justify-center space-x-4 mt-4">
            {isRegistration ? (
              <button
                onClick={captureImage}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Square className="mr-2 h-4 w-4" />
                Capture Photo
              </button>
            ) : (
              <button
                onClick={toggleDetection}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  isDetecting
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                <UserCheck className="mr-2 h-4 w-4" />
                {isDetecting ? 'Stop Detection' : 'Start Detection'}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};