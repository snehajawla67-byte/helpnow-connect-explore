import React, { useState } from 'react';
import { AlertTriangle, Phone, MessageSquare, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import toast from 'react-hot-toast';

const SOSButton = () => {
  const { t } = useLanguage();
  const [isActivated, setIsActivated] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const activateSOS = () => {
    setIsActivated(true);
    setCountdown(5);
    
    // Start countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          triggerEmergency();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Show immediate feedback
    toast.success('SOS Activated! Emergency services will be contacted in 5 seconds...');
  };

  const cancelSOS = () => {
    setIsActivated(false);
    setCountdown(0);
    toast.success('SOS Cancelled');
  };

  const triggerEmergency = () => {
    // In a real app, this would:
    // 1. Get user's current location
    // 2. Send emergency alert to contacts
    // 3. Contact local emergency services
    // 4. Start live location sharing
    
    toast.success('Emergency alert sent! Help is on the way.');
    
    // Mock emergency actions
    const mockActions = [
      'Location shared with emergency contacts',
      'Emergency services contacted',
      'Live location tracking activated',
      'Emergency message sent to nearby users'
    ];
    
    mockActions.forEach((action, index) => {
      setTimeout(() => {
        toast.success(action);
      }, (index + 1) * 1000);
    });
    
    setIsActivated(false);
  };

  if (isActivated) {
    return (
      <div className="fixed inset-0 bg-emergency/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md animate-bounce-in bg-emergency text-white border-emergency-light">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <AlertTriangle className="h-20 w-20 animate-pulse" />
                <div className="absolute inset-0 rounded-full animate-ping bg-white/30"></div>
              </div>
            </div>
            <CardTitle className="text-3xl font-bold">SOS ACTIVATED</CardTitle>
            <CardDescription className="text-white/90 text-lg">
              Emergency alert in {countdown} seconds
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-white/90">Emergency services will be contacted automatically</p>
              <div className="flex items-center justify-center space-x-2 text-sm">
                <MapPin className="h-4 w-4" />
                <span>Location: Detected & Shared</span>
              </div>
            </div>
            
            <Button
              onClick={cancelSOS}
              variant="outline"
              className="w-full bg-white text-emergency hover:bg-gray-100 border-white"
            >
              CANCEL SOS
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Button
      onClick={activateSOS}
      variant="ghost"
      size="sm"
      className="p-2 text-emergency hover:bg-emergency/10 animate-pulse-emergency"
      title="Emergency SOS"
    >
      <AlertTriangle className="h-5 w-5" />
    </Button>
  );
};

export default SOSButton;