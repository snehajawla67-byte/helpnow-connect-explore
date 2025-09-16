import React, { useState } from 'react';
import { Shield, MapPin, Users, Camera, AlertTriangle, Heart, Compass, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from '@/components/auth/AuthModal';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();

  const quickActions = [
    {
      icon: MapPin,
      title: t('nearbyPlaces'),
      description: 'Find hospitals, police stations, hotels nearby',
      color: 'bg-gradient-to-br from-primary to-primary-light',
      action: () => navigate('/map'),
    },
    {
      icon: Users,
      title: t('nearbyFriends'),
      description: 'Connect with fellow travelers',
      color: 'bg-gradient-to-br from-secondary to-secondary-light',
      action: () => navigate('/friends'),
    },
    {
      icon: Camera,
      title: t('emergencySnap'),
      description: 'Quick photo sharing for emergencies',
      color: 'bg-gradient-to-br from-accent to-accent-light',
      action: () => navigate('/snap'),
    },
  ];

  const safetyFeatures = [
    {
      icon: Shield,
      title: 'AI Safety Monitoring',
      description: 'Real-time danger zone alerts',
    },
    {
      icon: Compass,
      title: 'Safe Route Planning',
      description: 'Get the safest paths to your destination',
    },
    {
      icon: Heart,
      title: '24/7 Emergency Support',
      description: 'Always here when you need help',
    },
    {
      icon: Phone,
      title: 'Instant Emergency Contacts',
      description: 'One-tap access to help',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      {/* Hero Section */}
      <div className="relative pt-20 pb-8 px-4">
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Shield className="h-20 w-20 text-primary animate-float" />
              <div className="absolute -top-2 -right-2">
                <Badge className="bg-emergency text-white">24/7</Badge>
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gradient-hero leading-tight">
            {t('welcome')}
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('staySafe')} - Your AI-powered safety companion for every journey
          </p>

          {!user && (
            <Button
              onClick={() => setShowAuthModal(true)}
              className="btn-travel text-lg px-8 py-3 mt-6"
            >
              Get Started - Join Now
            </Button>
          )}

          {user && (
            <div className="mt-6 p-4 bg-white/80 backdrop-blur-md rounded-2xl border border-primary/20 inline-block">
              <p className="text-primary font-semibold">
                Welcome back, {user.username}! 👋
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 mb-8">
        <h2 className="text-2xl font-bold mb-6 text-center">{t('needHelp')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <Card
              key={index}
              className="card-feature cursor-pointer group"
              onClick={action.action}
            >
              <CardHeader className="pb-3">
                <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">{action.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  {action.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Safety Features */}
      <div className="px-4 mb-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Safety Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {safetyFeatures.map((feature, index) => (
            <div
              key={index}
              className="flex items-start space-x-4 p-4 bg-white/80 backdrop-blur-md rounded-xl border border-gray-200 hover:border-primary/30 transition-colors duration-300"
            >
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                  <feature.icon className="h-5 w-5 text-white" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Info */}
      <div className="px-4 mb-20">
        <Card className="bg-gradient-to-r from-emergency/10 to-warning/10 border-emergency/20">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-6 w-6 text-emergency" />
              <CardTitle className="text-lg">Emergency Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>Police:</strong> 100 | <strong>Fire:</strong> 101 | <strong>Ambulance:</strong> 108</p>
              <p><strong>Tourist Helpline:</strong> 1363 | <strong>Women Helpline:</strong> 1091</p>
              <p className="text-muted-foreground">
                For immediate emergency, use the SOS button (red button at bottom right)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  );
};

export default Home;