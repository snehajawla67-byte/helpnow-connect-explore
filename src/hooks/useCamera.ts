import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import toast from 'react-hot-toast';

interface CameraOptions {
  mediaType?: 'image' | 'video';
  quality?: number; // 0.1 to 1.0
  maxWidth?: number;
  maxHeight?: number;
}

interface MediaCapture {
  file: Blob;
  dataUrl: string;
  mediaType: 'image' | 'video';
}

export const useCamera = () => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const requestCameraPermission = useCallback(async (): Promise<boolean> => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user', // Front camera by default
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      setStream(mediaStream);
      setHasPermission(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      return true;
    } catch (error: any) {
      console.error('Camera permission denied:', error);
      setHasPermission(false);
      
      let errorMessage = 'Camera access denied';
      if (error.name === 'NotFoundError') {
        errorMessage = 'No camera found on this device';
      } else if (error.name === 'NotAllowedError') {
        errorMessage = 'Camera permission denied. Please allow camera access.';
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Camera is already in use by another application';
      }
      
      toast.error(errorMessage);
      return false;
    }
  }, []);

  const switchCamera = useCallback(async (facingMode: 'user' | 'environment') => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      return true;
    } catch (error) {
      console.error('Error switching camera:', error);
      toast.error('Failed to switch camera');
      return false;
    }
  }, [stream]);

  const capturePhoto = useCallback(async (options: CameraOptions = {}): Promise<MediaCapture | null> => {
    if (!stream || !videoRef.current || !canvasRef.current) {
      toast.error('Camera not ready');
      return null;
    }

    setIsCapturing(true);

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d')!;

      // Set canvas dimensions
      const { maxWidth = 1280, maxHeight = 720 } = options;
      canvas.width = Math.min(video.videoWidth, maxWidth);
      canvas.height = Math.min(video.videoHeight, maxHeight);

      // Draw the video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to blob
      const quality = options.quality || 0.8;
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', quality);
      });

      // Create data URL for preview
      const dataUrl = canvas.toDataURL('image/jpeg', quality);

      toast.success('Photo captured successfully');

      return {
        file: blob,
        dataUrl,
        mediaType: 'image'
      };
    } catch (error) {
      console.error('Error capturing photo:', error);
      toast.error('Failed to capture photo');
      return null;
    } finally {
      setIsCapturing(false);
    }
  }, [stream]);

  const uploadMedia = useCallback(async (
    mediaCapture: MediaCapture,
    options: {
      latitude?: number;
      longitude?: number;
      caption?: string;
      isEmergency?: boolean;
      isPublic?: boolean;
    } = {}
  ) => {
    try {
      // Convert blob to base64
      const base64Data = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]); // Remove data URL prefix
        };
        reader.readAsDataURL(mediaCapture.file);
      });

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please log in to upload media');
        return null;
      }

      const response = await supabase.functions.invoke('camera-upload', {
        body: {
          file_data: base64Data,
          media_type: mediaCapture.mediaType,
          ...options
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (options.isEmergency) {
        toast.success('Emergency photo uploaded and contacts notified');
      } else {
        toast.success('Media uploaded successfully');
      }

      return response.data;
    } catch (error: any) {
      console.error('Error uploading media:', error);
      toast.error(error.message || 'Failed to upload media');
      return null;
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  // File input capture for devices without camera API
  const captureFromFile = useCallback(async (file: File): Promise<MediaCapture | null> => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return null;
    }

    try {
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      return {
        file,
        dataUrl,
        mediaType: 'image'
      };
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error('Failed to process image');
      return null;
    }
  }, []);

  return {
    isCapturing,
    hasPermission,
    stream,
    videoRef,
    canvasRef,
    requestCameraPermission,
    switchCamera,
    capturePhoto,
    uploadMedia,
    stopCamera,
    captureFromFile
  };
};