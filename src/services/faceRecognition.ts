import * as faceapi from 'face-api.js';

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
      // Fallback: mark as loaded to continue with limited functionality
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

      if (this.labeledDescriptors.length === 0) {
        this.loadStoredFaces();
      }

      const faceMatcher = new faceapi.FaceMatcher(this.labeledDescriptors, 0.6);
      const result = faceMatcher.findBestMatch(detection.descriptor);
      
      return result.label !== 'unknown' ? result.label : null;
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

      // Store the face descriptor
      const faceData = {
        employeeId,
        descriptor: detection.descriptor,
        imageUrl: imageElement.src
      };
      
      this.storeFaceData(faceData);
      this.updateLabeledDescriptors();
      
      return detection.descriptor;
    } catch (error) {
      console.error('Face registration error:', error);
      return null;
    }
  }

  private storeFaceData(faceData: any) {
    const stored = localStorage.getItem('faceData') || '[]';
    const faceDataArray = JSON.parse(stored);
    
    // Remove existing data for this employee
    const filtered = faceDataArray.filter((data: any) => data.employeeId !== faceData.employeeId);
    filtered.push({
      ...faceData,
      descriptor: Array.from(faceData.descriptor) // Convert Float32Array to regular array for storage
    });
    
    localStorage.setItem('faceData', JSON.stringify(filtered));
  }

  private loadStoredFaces() {
    const stored = localStorage.getItem('faceData') || '[]';
    const faceDataArray = JSON.parse(stored);
    
    this.labeledDescriptors = faceDataArray.map((data: any) => {
      const descriptor = new Float32Array(data.descriptor);
      return new faceapi.LabeledFaceDescriptors(data.employeeId, [descriptor]);
    });
  }

  private updateLabeledDescriptors() {
    this.loadStoredFaces();
  }

  async startCamera(): Promise<MediaStream | null> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: videoDevices.length > 0 ? videoDevices[0].deviceId : undefined,
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      };
      
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (error) {
      console.error('Camera access error:', error);
      return null;
    }
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