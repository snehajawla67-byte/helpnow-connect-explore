import React, { useState, useEffect } from 'react';
import { MapPin, Search, Navigation, Plus, Phone, Star, Clock, Car, Home, Shield, Camera, AlertTriangle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLocation } from '@/hooks/useLocation';
import { useNearbyPlaces, type Place as PlaceType } from '@/hooks/useNearbyPlaces';
import CameraCapture from '@/components/camera/CameraCapture';
import { supabase } from '@/integrations/supabase/client';
import toast from 'react-hot-toast';

// Using the PlaceType from the hook, maintaining is_open naming convention
interface Place extends PlaceType {
  distance: string; // We'll format the distance_meters as string
}

const MapPage = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddPlace, setShowAddPlace] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [newPlace, setNewPlace] = useState({ name: '', type: '', phone: '', address: '' });
  
  // Real backend hooks
  const { 
    currentLocation, 
    isLoading: locationLoading, 
    getCurrentLocation, 
    safetyData 
  } = useLocation();
  
  const {
    places: backendPlaces,
    safetyInfo,
    isLoading: placesLoading,
    fetchNearbyPlaces,
    addPlace,
    getDirections,
    formatDistance
  } = useNearbyPlaces();

  // Convert backend places to local format
  const places: Place[] = backendPlaces.map(place => ({
    ...place,
    distance: formatDistance(place.distance_meters)
  }));

  const categories = [
    { id: 'all', label: 'All Places', icon: MapPin },
    { id: 'hospital', label: t('hospitals'), icon: Plus },
    { id: 'police', label: t('policeStations'), icon: Shield },
    { id: 'hotel', label: t('hotels'), icon: MapPin },
    { id: 'restaurant', label: t('restaurants'), icon: Star },
    { id: 'travel', label: t('travelAgencies'), icon: Navigation },
    { id: 'guide', label: t('touristGuides'), icon: Star },
    { id: 'vehicle', label: 'Travel Vehicles', icon: Car },
    { id: 'home', label: 'Local Homes', icon: Home },
    { id: 'safety', label: 'Safety Places', icon: Shield },
  ];

  // Fetch nearby places when location is available
  useEffect(() => {
    if (currentLocation) {
      fetchNearbyPlaces(currentLocation.latitude, currentLocation.longitude, {
        radius: 5000,
        type: selectedCategory === 'all' ? undefined : selectedCategory
      });
    }
  }, [currentLocation, selectedCategory, fetchNearbyPlaces]);

  const filteredPlaces = places.filter(place => {
    const matchesCategory = selectedCategory === 'all' || place.type === selectedCategory;
    const matchesSearch = place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         place.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddPlace = async () => {
    if (newPlace.name && newPlace.type && currentLocation) {
      const success = await addPlace({
        name: newPlace.name,
        type: newPlace.type,
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        address: newPlace.address || undefined,
        phone: newPlace.phone || undefined
      });
      
      if (success) {
        setNewPlace({ name: '', type: '', phone: '', address: '' });
        setShowAddPlace(false);
      }
    }
  };

  const requestHelp = async (place: Place) => {
    if (!currentLocation) {
      toast.error('Location not available');
      return;
    }
    
    try {
      const response = await supabase.functions.invoke('emergency-services/emergency', {
        body: {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          emergency_type: place.type === 'hospital' ? 'medical' : 
                         place.type === 'police' ? 'police' : 'general',
          description: `Help requested at ${place.name}`,
          severity: 3
        }
      });
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      toast.success(`Emergency services notified! ${response.data?.emergency_response?.emergency_number || 'Help is on the way'}`);
    } catch (error: any) {
      console.error('Error requesting help:', error);
      toast.error('Failed to send help request');
    }
  };

  const handleCameraCapture = (mediaData: any) => {
    console.log('Media captured:', mediaData);
    toast.success('Photo uploaded successfully!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-primary/5 pt-20 pb-20">
      {/* Header */}
      <div className="px-4 mb-6">
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold text-gradient-travel mb-2">{t('map')}</h1>
          <div className="flex items-center justify-center text-muted-foreground">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="text-sm">
              {locationLoading ? 'Getting location...' : 
               currentLocation ? currentLocation.address || `${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)}` :
               'Location not available'}
            </span>
          </div>
          
          {/* Safety Score Display */}
          {safetyInfo && (
            <div className={`mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              safetyInfo.overall_safety_score >= 4 ? 'bg-success/20 text-success' :
              safetyInfo.overall_safety_score >= 3 ? 'bg-warning/20 text-warning' :
              'bg-emergency/20 text-emergency'
            }`}>
              <Shield className="h-3 w-3 mr-1" />
              Safety Score: {safetyInfo.overall_safety_score}/5
            </div>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search nearby places..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-4">
          <Button
            onClick={() => setShowCamera(true)}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Camera className="h-4 w-4" />
            Camera
          </Button>
          
          <div className="flex gap-2">
            <Dialog open={showAddPlace} onOpenChange={setShowAddPlace}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Place
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Place</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="place-name">Place Name</Label>
                  <Input
                    id="place-name"
                    value={newPlace.name}
                    onChange={(e) => setNewPlace({ ...newPlace, name: e.target.value })}
                    placeholder="Enter place name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="place-type">Type</Label>
                  <select
                    id="place-type"
                    value={newPlace.type}
                    onChange={(e) => setNewPlace({ ...newPlace, type: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-md"
                  >
                    <option value="">Select type</option>
                    <option value="hospital">Hospital</option>
                    <option value="police">Police Station</option>
                    <option value="hotel">Hotel</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="travel">Travel Agency</option>
                    <option value="guide">Tourist Guide</option>
                    <option value="vehicle">Travel Vehicle</option>
                    <option value="home">Local Home</option>
                    <option value="safety">Safety Place</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="place-address">Address (Optional)</Label>
                  <Input
                    id="place-address"
                    value={newPlace.address}
                    onChange={(e) => setNewPlace({ ...newPlace, address: e.target.value })}
                    placeholder="Enter address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="place-phone">Phone (Optional)</Label>
                  <Input
                    id="place-phone"
                    value={newPlace.phone}
                    onChange={(e) => setNewPlace({ ...newPlace, phone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>
                <Button onClick={handleAddPlace} className="w-full btn-travel">
                  Add Place
                </Button>
              </div>
            </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="px-4 mb-6">
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid grid-cols-5 lg:grid-cols-10 mb-4 h-auto">
            {categories.map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="flex flex-col items-center gap-1 text-xs p-2 min-h-[60px]"
              >
                <category.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{category.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Mock Map Area */}
      <div className="px-4 mb-6">
        <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl h-48 flex items-center justify-center border-2 border-dashed border-primary/30">
          <div className="text-center">
            <MapPin className="h-12 w-12 mx-auto mb-2 text-primary" />
            <p className="text-primary font-semibold">Interactive Map</p>
            <p className="text-sm text-muted-foreground">Showing nearby places around you</p>
          </div>
        </div>
      </div>

      {/* Safety Alerts */}
      {safetyInfo && safetyInfo.recent_incidents.length > 0 && (
        <div className="px-4 mb-4">
          <Card className="border-warning bg-warning/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-warning">
                <AlertTriangle className="h-4 w-4" />
                Recent Safety Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {safetyInfo.recent_incidents.slice(0, 3).map((incident, index) => (
                  <p key={index} className="text-xs text-muted-foreground">
                    {incident.type} incident • {formatDistance(incident.distance)} away
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Places List */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">
            {t('nearbyPlaces')} ({filteredPlaces.length})
          </h2>
          {placesLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              Loading...
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          {filteredPlaces.map((place) => (
            <Card key={place.id} className="card-feature">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {place.name}
                      {place.is_open ? (
                        <Badge className="bg-success text-white">Open</Badge>
                      ) : (
                        <Badge variant="secondary">
                          <Clock className="h-3 w-3 mr-1" />
                          Closed
                        </Badge>
                      )}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {place.type}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{place.distance}</span>
                      {place.rating > 0 && (
                        <div className="flex items-center">
                          <Star className="h-3 w-3 text-warning fill-current" />
                          <span className="text-xs ml-1">{place.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <CardDescription className="mb-3">
                  {place.address}
                  {place.phone && (
                    <>
                      <br />
                      <span className="text-primary">📞 {place.phone}</span>
                    </>
                  )}
                </CardDescription>
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => getDirections(place)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Navigation className="h-4 w-4 mr-1" />
                    Directions
                  </Button>
                  
                  {place.phone && (
                    <Button
                      onClick={() => window.open(`tel:${place.phone}`)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Phone className="h-4 w-4 mr-1" />
                      Call
                    </Button>
                  )}
                  
                  <Button
                    onClick={() => requestHelp(place)}
                    size="sm"
                    className="btn-secondary flex-1"
                  >
                    Request Help
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPlaces.length === 0 && (
          <div className="text-center py-8">
            <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No places found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or category filter
            </p>
          </div>
        )}
      </div>

      {/* Camera Component */}
      <CameraCapture
        isOpen={showCamera}
        onClose={() => setShowCamera(false)}
        onCapture={handleCameraCapture}
      />
    </div>
  );
};

export default MapPage;