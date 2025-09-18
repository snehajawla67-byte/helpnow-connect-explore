import React, { useState, useEffect } from 'react';
import { Camera, RotateCcw, X, Upload, AlertTriangle, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useCamera } from '@/hooks/useCamera';
import { useLocation } from '@/hooks/useLocation';
import toast from 'react-hot-toast';

interface CameraCaptureProps {
  onCapture?: (mediaData: any) => void;
  isOpen: boolean;
  onClose: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, isOpen, onClose }) => {
  const [capturedMedia, setCapturedMedia] = useState<any>(null);
  const [caption, setCaption] = useState('');
  const [isEmergency, setIsEmergency] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [isUploading, setIsUploading] = useState(false);

  const {
    isCapturing,
    hasPermission,
    videoRef,
    canvasRef,
    requestCameraPermission,
    switchCamera,
    capturePhoto,
    uploadMedia,
    stopCamera,
    captureFromFile
  } = useCamera();

  const { currentLocation } = useLocation();

  useEffect(() => {
    if (isOpen && hasPermission === null) {
      requestCameraPermission();
    }
  }, [isOpen, hasPermission, requestCameraPermission]);

  useEffect(() => {
    return () => {
      if (!isOpen) {
        stopCamera();
        setCapturedMedia(null);
        setCaption('');
        setIsEmergency(false);
      }
    };
  }, [isOpen, stopCamera]);

  const handleCapture = async () => {
    const media = await capturePhoto();
    if (media) {
      setCapturedMedia(media);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const media = await captureFromFile(file);
      if (media) {
        setCapturedMedia(media);
      }
    }
  };

  const handleSwitchCamera = async () => {
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    const success = await switchCamera(newFacingMode);
    if (success) {
      setFacingMode(newFacingMode);
    }
  };

  const handleUpload = async () => {
    if (!capturedMedia) return;

    setIsUploading(true);
    
    try {
      const uploadOptions = {
        latitude: currentLocation?.latitude,
        longitude: currentLocation?.longitude,
        caption: caption || undefined,
        isEmergency,
        isPublic
      };

      const result = await uploadMedia(capturedMedia, uploadOptions);
      
      if (result) {
        onCapture?.(result);
        handleReset();
        onClose();
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setCapturedMedia(null);
    setCaption('');
    setIsEmergency(false);
    setIsPublic(false);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            {capturedMedia ? 'Review & Upload' : 'Camera Capture'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!capturedMedia ? (
            // Camera Interface
            <div className="space-y-4">
              {hasPermission === false ? (
                <Card className="p-6 text-center">
                  <Camera className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Camera Access Required</h3>
                  <p className="text-muted-foreground mb-4">
                    Please allow camera access to take photos
                  </p>
                  <Button onClick={requestCameraPermission}>
                    Allow Camera Access
                  </Button>
                </Card>
              ) : hasPermission === true ? (
                <>
                  {/* Camera Preview */}
                  <div className="relative bg-black rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-64 object-cover"
                    />
                    <canvas ref={canvasRef} className="hidden" />
                    
                    {/* Camera Controls */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleSwitchCamera}
                        className="bg-black/50 border-white/20 hover:bg-black/70"
                      >
                        <RotateCcw className="h-4 w-4 text-white" />
                      </Button>
                      
                      <Button
                        onClick={handleCapture}
                        disabled={isCapturing}
                        size="lg"
                        className="btn-travel"
                      >
                        {isCapturing ? 'Capturing...' : 'Capture'}
                      </Button>
                    </div>
                  </div>

                  {/* Alternative File Upload */}
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">Or upload from device</p>
                    <Label htmlFor="file-upload" className="cursor-pointer">
                      <div className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-primary/30 rounded-lg hover:border-primary/50 transition-colors">
                        <Upload className="h-4 w-4" />
                        <span>Choose from Gallery</span>
                      </div>
                    </Label>
                    <Input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                </>
              ) : (
                <div className="text-center p-8">
                  <Camera className="h-12 w-12 mx-auto mb-4 animate-pulse text-primary" />
                  <p>Initializing camera...</p>
                </div>
              )}
            </div>
          ) : (
            // Preview and Upload Interface
            <div className="space-y-4">
              {/* Image Preview */}
              <div className="relative">
                <img
                  src={capturedMedia.dataUrl}
                  alt="Captured"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleReset}
                  className="absolute top-2 right-2 bg-black/50 border-white/20 hover:bg-black/70"
                >
                  <X className="h-4 w-4 text-white" />
                </Button>
              </div>

              {/* Upload Options */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="caption">Caption (Optional)</Label>
                  <Textarea
                    id="caption"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Add a description or note..."
                    className="resize-none"
                  />
                </div>

                {/* Emergency Toggle */}
                <div className="flex items-center justify-between p-3 border rounded-lg bg-emergency/5 border-emergency/20">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-emergency" />
                    <div>
                      <Label htmlFor="emergency" className="font-semibold text-emergency">
                        Emergency Photo
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Will notify your emergency contacts
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="emergency"
                    checked={isEmergency}
                    onCheckedChange={setIsEmergency}
                  />
                </div>

                {/* Location Info */}
                {currentLocation && (
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg text-sm">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>
                      Location: {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
                    </span>
                  </div>
                )}

                {/* Public Toggle */}
                <div className="flex items-center justify-between">
                  <Label htmlFor="public" className="text-sm">
                    Make photo public (visible to other users)
                  </Label>
                  <Switch
                    id="public"
                    checked={isPublic}
                    onCheckedChange={setIsPublic}
                  />
                </div>

                {/* Upload Actions */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    className="flex-1"
                  >
                    Retake
                  </Button>
                  <Button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className={`flex-1 ${isEmergency ? 'btn-emergency' : 'btn-travel'}`}
                  >
                    {isUploading ? 'Uploading...' : isEmergency ? 'Send Emergency Photo' : 'Upload Photo'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CameraCapture;