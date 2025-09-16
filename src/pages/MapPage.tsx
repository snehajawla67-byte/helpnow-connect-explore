import React, { useState, useEffect } from 'react';
import { MapPin, Search, Navigation, Plus, Phone, Star, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import toast from 'react-hot-toast';

interface Place {
  id: string;
  name: string;
  type: string;
  distance: string;
  rating: number;
  address: string;
  phone?: string;
  isOpen: boolean;
}

const MapPage = () => {
  const { t } = useLanguage();
  const [currentLocation, setCurrentLocation] = useState<string>('Getting location...');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddPlace, setShowAddPlace] = useState(false);
  const [newPlace, setNewPlace] = useState({ name: '', type: '', phone: '', address: '' });

  // Mock places data
  const [places, setPlaces] = useState<Place[]>([
    {
      id: '1',
      name: 'City Hospital',
      type: 'hospital',
      distance: '0.5 km',
      rating: 4.5,
      address: 'Main Street, Downtown',
      phone: '+91 9876543210',
      isOpen: true,
    },
    {
      id: '2',
      name: 'Police Station Central',
      type: 'police',
      distance: '0.8 km',
      rating: 4.2,
      address: 'Government Square',
      phone: '100',
      isOpen: true,
    },
    {
      id: '3',
      name: 'Grand Hotel',
      type: 'hotel',
      distance: '1.2 km',
      rating: 4.8,
      address: 'Tourist District',
      phone: '+91 9876543211',
      isOpen: true,
    },
    {
      id: '4',
      name: 'Spice Garden Restaurant',
      type: 'restaurant',
      distance: '0.3 km',
      rating: 4.6,
      address: 'Food Street',
      phone: '+91 9876543212',
      isOpen: true,
    },
    {
      id: '5',
      name: 'Travel Experts Agency',
      type: 'travel',
      distance: '0.7 km',
      rating: 4.3,
      address: 'Business Center',
      phone: '+91 9876543213',
      isOpen: false,
    },
    {
      id: '6',
      name: 'Local Guide Services',
      type: 'guide',
      distance: '0.4 km',
      rating: 4.7,
      address: 'Tourist Information Center',
      phone: '+91 9876543214',
      isOpen: true,
    },
  ]);

  const categories = [
    { id: 'all', label: 'All Places', icon: MapPin },
    { id: 'hospital', label: t('hospitals'), icon: Plus },
    { id: 'police', label: t('policeStations'), icon: Star },
    { id: 'hotel', label: t('hotels'), icon: MapPin },
    { id: 'restaurant', label: t('restaurants'), icon: Star },
    { id: 'travel', label: t('travelAgencies'), icon: Navigation },
    { id: 'guide', label: t('touristGuides'), icon: Star },
  ];

  useEffect(() => {
    // Mock location detection
    setTimeout(() => {
      setCurrentLocation('New Delhi, India');
      toast.success('Location detected successfully!');
    }, 2000);
  }, []);

  const filteredPlaces = places.filter(place => {
    const matchesCategory = selectedCategory === 'all' || place.type === selectedCategory;
    const matchesSearch = place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         place.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddPlace = () => {
    if (newPlace.name && newPlace.type) {
      const place: Place = {
        id: Date.now().toString(),
        name: newPlace.name,
        type: newPlace.type,
        distance: '0.1 km',
        rating: 0,
        address: newPlace.address || 'User Added Location',
        phone: newPlace.phone,
        isOpen: true,
      };
      setPlaces([...places, place]);
      setNewPlace({ name: '', type: '', phone: '', address: '' });
      setShowAddPlace(false);
      toast.success('Place added successfully!');
    }
  };

  const requestHelp = (place: Place) => {
    toast.success(`Help request sent to ${place.name}`);
  };

  const getDirections = (place: Place) => {
    toast.success(`Getting directions to ${place.name}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-primary/5 pt-20 pb-20">
      {/* Header */}
      <div className="px-4 mb-6">
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold text-gradient-travel mb-2">{t('map')}</h1>
          <div className="flex items-center justify-center text-muted-foreground">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="text-sm">{currentLocation}</span>
          </div>
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

        {/* Add Place Button */}
        <div className="flex justify-end mb-4">
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

      {/* Category Tabs */}
      <div className="px-4 mb-6">
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid grid-cols-4 lg:grid-cols-7 mb-4 h-auto">
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

      {/* Places List */}
      <div className="px-4">
        <h2 className="text-xl font-bold mb-4">
          {t('nearbyPlaces')} ({filteredPlaces.length})
        </h2>
        
        <div className="space-y-4">
          {filteredPlaces.map((place) => (
            <Card key={place.id} className="card-feature">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {place.name}
                      {place.isOpen ? (
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
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
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
    </div>
  );
};

export default MapPage;