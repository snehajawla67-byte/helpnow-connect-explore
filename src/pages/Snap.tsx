import React, { useState, useRef } from 'react';
import { Camera, Upload, Send, Users, MapPin, Clock, AlertTriangle, Share2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import toast from 'react-hot-toast';

interface SnapItem {
  id: string;
  image: string;
  caption: string;
  timestamp: string;
  location: string;
  isEmergency: boolean;
  shareCount: number;
}

const Snap = () => {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [isEmergencySnap, setIsEmergencySnap] = useState(false);
  const [snaps, setSnaps] = useState<SnapItem[]>([
    {
      id: '1',
      image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400&h=300&fit=crop',
      caption: 'Beautiful view from India Gate! 📸',
      timestamp: '2 hours ago',
      location: 'India Gate, New Delhi',
      isEmergency: false,
      shareCount: 5,
    },
    {
      id: '2',
      image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&h=300&fit=crop',
      caption: 'EMERGENCY: Need help at this location!',
      timestamp: '1 day ago',
      location: 'Red Fort Area, Delhi',
      isEmergency: true,
      shareCount: 12,
    },
  ]);

  const emergencyContacts = [
    { name: 'Police Station', phone: '100' },
    { name: 'Ambulance', phone: '108' },
    { name: 'Fire Service', phone: '101' },
    { name: 'Tourist Helpline', phone: '1363' },
  ];

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = () => {
    // In a real app, this would open the device camera
    toast.success('Camera feature would open here in a real app');
    setShowCamera(false);
  };

  const shareSnap = () => {
    if (selectedImage) {
      const newSnap: SnapItem = {
        id: Date.now().toString(),
        image: selectedImage,
        caption: caption || (isEmergencySnap ? 'EMERGENCY: Need assistance!' : 'New snap'),
        timestamp: 'Just now',
        location: 'Current Location',
        isEmergency: isEmergencySnap,
        shareCount: 0,
      };

      setSnaps([newSnap, ...snaps]);
      setSelectedImage(null);
      setCaption('');
      setIsEmergencySnap(false);

      if (isEmergencySnap) {
        toast.success('Emergency snap shared with contacts and authorities!');
        // Mock emergency notifications
        setTimeout(() => {
          toast.success('Emergency services notified');
        }, 1000);
        setTimeout(() => {
          toast.success('Location shared with emergency contacts');
        }, 2000);
      } else {
        toast.success('Snap shared successfully!');
      }
    }
  };

  const shareToEmergencyContacts = (snap: SnapItem) => {
    toast.success(`Emergency snap sent to ${emergencyContacts.length} contacts!`);
  };

  const downloadSnap = (snap: SnapItem) => {
    toast.success('Snap downloaded to your device');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 pt-20 pb-20">
      {/* Header */}
      <div className="px-4 mb-6">
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold text-gradient-travel mb-2">{t('snap')}</h1>
          <p className="text-muted-foreground">Share moments and get help when needed</p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="btn-travel h-20 flex-col gap-2"
          >
            <Upload className="h-6 w-6" />
            <span>Upload Photo</span>
          </Button>
          
          <Button
            onClick={() => setShowCamera(true)}
            className="btn-secondary h-20 flex-col gap-2"
          >
            <Camera className="h-6 w-6" />
            <span>Take Photo</span>
          </Button>
        </div>

        {/* Emergency Alert */}
        <Card className="bg-gradient-to-r from-emergency/10 to-warning/10 border-emergency/20 mb-6">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-emergency" />
              <CardTitle className="text-lg">Emergency Snap</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              In emergency situations, your snap will be automatically sent to emergency contacts and authorities
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {emergencyContacts.map((contact, index) => (
                <div key={index} className="flex items-center space-x-1">
                  <span className="font-medium">{contact.name}:</span>
                  <span className="text-emergency">{contact.phone}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected Image Preview */}
      {selectedImage && (
        <div className="px-4 mb-6">
          <Card className="card-feature">
            <CardHeader>
              <CardTitle>Share Your Snap</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <img
                  src={selectedImage}
                  alt="Selected"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <div className="absolute top-2 right-2">
                  <Button
                    onClick={() => setSelectedImage(null)}
                    variant="destructive"
                    size="sm"
                  >
                    Remove
                  </Button>
                </div>
              </div>
              
              <Textarea
                placeholder="Add a caption..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={3}
              />
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="emergency"
                  checked={isEmergencySnap}
                  onChange={(e) => setIsEmergencySnap(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="emergency" className="text-sm font-medium">
                  This is an emergency snap
                </label>
              </div>

              {isEmergencySnap && (
                <div className="bg-emergency/10 border border-emergency/20 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-emergency" />
                    <span className="text-sm font-medium text-emergency">Emergency Mode</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This snap will be sent to emergency services and your emergency contacts with your current location.
                  </p>
                </div>
              )}
              
              <Button
                onClick={shareSnap}
                className={isEmergencySnap ? "btn-emergency w-full" : "btn-travel w-full"}
              >
                <Send className="h-4 w-4 mr-2" />
                {isEmergencySnap ? 'Send Emergency Snap' : 'Share Snap'}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Snaps Feed */}
      <div className="px-4">
        <h2 className="text-xl font-bold mb-4">Recent Snaps</h2>
        
        <div className="space-y-4">
          {snaps.map((snap) => (
            <Card key={snap.id} className="card-feature">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant={snap.isEmergency ? "destructive" : "default"}>
                      {snap.isEmergency ? (
                        <>
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Emergency
                        </>
                      ) : (
                        <>
                          <Camera className="h-3 w-3 mr-1" />
                          Regular
                        </>
                      )}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {snap.timestamp}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <Share2 className="h-3 w-3" />
                    <span>{snap.shareCount}</span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="relative mb-3">
                  <img
                    src={snap.image}
                    alt="Snap"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  {snap.isEmergency && (
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-emergency text-white animate-pulse">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        EMERGENCY
                      </Badge>
                    </div>
                  )}
                </div>
                
                <CardDescription className="mb-3">
                  {snap.caption}
                </CardDescription>
                
                <div className="flex items-center text-sm text-muted-foreground mb-3">
                  <MapPin className="h-3 w-3 mr-1" />
                  {snap.location}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => downloadSnap(snap)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                  
                  {snap.isEmergency && (
                    <Button
                      onClick={() => shareToEmergencyContacts(snap)}
                      size="sm"
                      className="btn-emergency flex-1"
                    >
                      <Send className="h-4 w-4 mr-1" />
                      Send to Contacts
                    </Button>
                  )}
                  
                  {!snap.isEmergency && (
                    <Button
                      size="sm"
                      className="btn-secondary flex-1"
                    >
                      <Share2 className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {snaps.length === 0 && (
          <div className="text-center py-8">
            <Camera className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No snaps yet</h3>
            <p className="text-muted-foreground">
              Take or upload your first photo to get started
            </p>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
      />

      {/* Camera Dialog */}
      <Dialog open={showCamera} onOpenChange={setShowCamera}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Camera</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg h-64 flex items-center justify-center border-2 border-dashed border-primary/30">
              <div className="text-center">
                <Camera className="h-12 w-12 mx-auto mb-2 text-primary" />
                <p className="text-primary font-semibold">Camera Preview</p>
                <p className="text-sm text-muted-foreground">Camera would open here in a real app</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleCameraCapture}
                className="btn-travel flex-1"
              >
                <Camera className="h-4 w-4 mr-2" />
                Capture
              </Button>
              
              <Button
                onClick={() => setShowCamera(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Snap;