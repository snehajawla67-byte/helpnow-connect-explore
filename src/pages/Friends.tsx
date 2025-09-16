import React, { useState } from 'react';
import { Users, UserPlus, MessageCircle, MapPin, Send, Phone, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import toast from 'react-hot-toast';

interface Friend {
  id: string;
  name: string;
  distance: string;
  status: 'online' | 'offline' | 'traveling';
  lastSeen: string;
  location: string;
  isNearby: boolean;
}

interface ChatMessage {
  id: string;
  senderId: string;
  message: string;
  timestamp: string;
  type: 'text' | 'location';
}

const Friends = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('nearby');
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      senderId: '2',
      message: 'Hey! Are you still in Delhi?',
      timestamp: '10:30 AM',
      type: 'text',
    },
    {
      id: '2',
      senderId: 'me',
      message: 'Yes! Just visited Red Fort. Where are you?',
      timestamp: '10:32 AM',
      type: 'text',
    },
    {
      id: '3',
      senderId: '2',
      message: 'I\'m near India Gate. Want to meet up?',
      timestamp: '10:35 AM',
      type: 'text',
    },
  ]);

  const [nearbyFriends] = useState<Friend[]>([
    {
      id: '1',
      name: 'Priya Sharma',
      distance: '0.2 km',
      status: 'online',
      lastSeen: 'Active now',
      location: 'Connaught Place',
      isNearby: true,
    },
    {
      id: '2',
      name: 'Rahul Kumar',
      distance: '0.5 km',
      status: 'traveling',
      lastSeen: '5 mins ago',
      location: 'Red Fort Area',
      isNearby: true,
    },
    {
      id: '3',
      name: 'Sarah Johnson',
      distance: '1.2 km',
      status: 'online',
      lastSeen: 'Active now',
      location: 'India Gate',
      isNearby: true,
    },
  ]);

  const [allFriends] = useState<Friend[]>([
    ...nearbyFriends,
    {
      id: '4',
      name: 'Alex Smith',
      distance: '250 km',
      status: 'offline',
      lastSeen: '2 hours ago',
      location: 'Mumbai',
      isNearby: false,
    },
    {
      id: '5',
      name: 'Maria Garcia',
      distance: '500 km',
      status: 'traveling',
      lastSeen: '1 hour ago',
      location: 'Goa',
      isNearby: false,
    },
  ]);

  const [pendingRequests] = useState([
    {
      id: '1',
      name: 'John Doe',
      distance: '0.3 km',
      location: 'Tourist Area',
      mutualFriends: 2,
    },
    {
      id: '2',
      name: 'Lisa Wang',
      distance: '0.8 km',
      location: 'Shopping District',
      mutualFriends: 1,
    },
  ]);

  const sendFriendRequest = (personId: string, name: string) => {
    toast.success(`Friend request sent to ${name}!`);
  };

  const acceptRequest = (requestId: string, name: string) => {
    toast.success(`${name} is now your friend!`);
  };

  const startChat = (friend: Friend) => {
    setSelectedFriend(friend);
    setShowChat(true);
  };

  const sendMessage = () => {
    if (chatMessage.trim() && selectedFriend) {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        senderId: 'me',
        message: chatMessage.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'text',
      };
      setChatMessages([...chatMessages, newMessage]);
      setChatMessage('');
      
      // Mock response after 2 seconds
      setTimeout(() => {
        const response: ChatMessage = {
          id: (Date.now() + 1).toString(),
          senderId: selectedFriend.id,
          message: 'Got it! Let me know if you need any help.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'text',
        };
        setChatMessages(prev => [...prev, response]);
      }, 2000);
    }
  };

  const shareLocation = (friend: Friend) => {
    toast.success(`Location shared with ${friend.name}!`);
    
    if (selectedFriend) {
      const locationMessage: ChatMessage = {
        id: Date.now().toString(),
        senderId: 'me',
        message: 'Current location: Red Fort, Delhi',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'location',
      };
      setChatMessages([...chatMessages, locationMessage]);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'traveling': return 'bg-blue-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Online';
      case 'traveling': return 'Traveling';
      default: return 'Offline';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-secondary/5 pt-20 pb-20">
      {/* Header */}
      <div className="px-4 mb-6">
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold text-gradient-travel mb-2">{t('friends')}</h1>
          <p className="text-muted-foreground">Connect with fellow travelers and locals</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="nearby" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Nearby</span>
            </TabsTrigger>
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">All Friends</span>
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Requests</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="nearby" className="space-y-4 mt-6">
            <div className="text-center mb-4">
              <Badge className="bg-success text-white">
                {nearbyFriends.length} friends nearby
              </Badge>
            </div>
            
            {nearbyFriends.map((friend) => (
              <Card key={friend.id} className="card-feature">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
                            {friend.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(friend.status)}`}></div>
                      </div>
                      <div>
                        <CardTitle className="text-lg">{friend.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          {friend.distance} away • {friend.location}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {getStatusText(friend.status)}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => startChat(friend)}
                      size="sm"
                      className="btn-travel flex-1"
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      {t('chatNow')}
                    </Button>
                    
                    <Button
                      onClick={() => shareLocation(friend)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <MapPin className="h-4 w-4 mr-1" />
                      {t('shareLocation')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="all" className="space-y-4 mt-6">
            {allFriends.map((friend) => (
              <Card key={friend.id} className="card-feature">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
                            {friend.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(friend.status)}`}></div>
                      </div>
                      <div>
                        <CardTitle className="text-lg">{friend.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          {friend.distance} away • {friend.location}
                        </CardDescription>
                        <p className="text-xs text-muted-foreground">
                          {friend.lastSeen}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Badge variant="outline">
                        {getStatusText(friend.status)}
                      </Badge>
                      {friend.isNearby && (
                        <Badge className="bg-success text-white text-xs">
                          Nearby
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => startChat(friend)}
                      size="sm"
                      variant="outline"
                      className="flex-1"
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      Chat
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                    >
                      <Phone className="h-4 w-4 mr-1" />
                      Call
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="requests" className="space-y-4 mt-6">
            {pendingRequests.length > 0 ? (
              pendingRequests.map((request) => (
                <Card key={request.id} className="card-feature">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-gradient-to-br from-secondary to-accent text-white">
                            {request.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{request.name}</CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            <MapPin className="h-3 w-3" />
                            {request.distance} away • {request.location}
                          </CardDescription>
                          <p className="text-xs text-muted-foreground">
                            {request.mutualFriends} mutual friends
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => acceptRequest(request.id, request.name)}
                        size="sm"
                        className="btn-secondary flex-1"
                      >
                        {t('acceptRequest')}
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        Decline
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <UserPlus className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No pending requests</h3>
                <p className="text-muted-foreground">
                  Friend requests will appear here
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Chat Dialog */}
      <Dialog open={showChat} onOpenChange={setShowChat}>
        <DialogContent className="max-w-md mx-auto max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-sm">
                  {selectedFriend?.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              {selectedFriend?.name}
              <Badge variant="outline" className="ml-auto">
                {selectedFriend && getStatusText(selectedFriend.status)}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 space-y-4 max-h-96 overflow-y-auto">
            {chatMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.senderId === 'me' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg ${
                    message.senderId === 'me'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 dark:bg-gray-800'
                  }`}
                >
                  <p className="text-sm">{message.message}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.senderId === 'me' ? 'text-white/70' : 'text-muted-foreground'
                    }`}
                  >
                    {message.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex gap-2 pt-2 border-t">
            <Button
              onClick={() => selectedFriend && shareLocation(selectedFriend)}
              variant="outline"
              size="sm"
            >
              <MapPin className="h-4 w-4" />
            </Button>
            
            <Input
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Type a message..."
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1"
            />
            
            <Button onClick={sendMessage} size="sm" className="btn-travel">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Friends;