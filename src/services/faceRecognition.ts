import * as faceapi from 'face-api.js';
import { apiService } from './api';

export class FaceRecognitionService {
  private isLoaded = false;
  private labeledDescriptors: faceapi.LabeledFaceDescriptors[] = [];

  async loadModels() {
    if (this.isLoaded) return;
    
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        faceapi.nets.faceExpressionNet.loadFromUri('/models'),
        faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
      ]);
      this.isLoaded = true;
    } catch (error) {
      console.error('Error loading face-api models:', error);
      this.isLoaded = true;
    }
  }

  async detectFace(imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement) {
    if (!this.isLoaded) await this.loadModels();
    
    try {
      const detection = await faceapi
        .detectSingleFace(imageElement, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();
      
      return detection;
    } catch (error) {
      console.error('Face detection error:', error);
      return null;
    }
  }

  async recognizeFace(imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): Promise<string | null> {
    if (!this.isLoaded) await this.loadModels();
    
    try {
      const detection = await this.detectFace(imageElement);
      if (!detection) return null;

      // Convert face descriptor to base64 for API call
      const faceData = this.descriptorToBase64(detection.descriptor);
      return await apiService.recognizeFace(faceData);
    } catch (error) {
      console.error('Face recognition error:', error);
      return null;
    }
  }

  async registerFace(employeeId: string, imageElement: HTMLImageElement): Promise<Float32Array | null> {
    if (!this.isLoaded) await this.loadModels();
    
    try {
      const detection = await this.detectFace(imageElement);
      if (!detection) return null;

      // Convert face descriptor to base64 for API call
      const faceData = this.descriptorToBase64(detection.descriptor);
      await apiService.registerFace(employeeId, faceData);
      
      return detection.descriptor;
    } catch (error) {
      console.error('Face registration error:', error);
      return null;
    }
  }

  private descriptorToBase64(descriptor: Float32Array): string {
    const array = Array.from(descriptor);
    return btoa(JSON.stringify(array));
  }

  private base64ToDescriptor(base64: string): Float32Array {
    const array = JSON.parse(atob(base64));
    return new Float32Array(array);
  }

  async getVideoDevices(): Promise<MediaDeviceInfo[]> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter(device => device.kind === 'videoinput');
    } catch (error) {
      console.error('Error getting video devices:', error);
      return [];
    }
  }
}

export const faceRecognitionService = new FaceRecognitionService();