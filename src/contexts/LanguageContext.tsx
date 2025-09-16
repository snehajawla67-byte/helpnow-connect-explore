import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Navigation
    home: 'Home',
    map: 'Map',
    friends: 'Friends',
    snap: 'Snap',
    
    // Auth
    signIn: 'Sign In',
    signUp: 'Sign Up',
    username: 'Username',
    password: 'Password',
    login: 'Login',
    register: 'Register',
    
    // Home
    welcome: 'Welcome to Travel Saviours',
    staySafe: 'Stay Safe While Traveling',
    needHelp: 'Need Help?',
    emergencySupport: 'Emergency Support 24/7',
    
    // Map
    nearbyPlaces: 'Nearby Places',
    hotels: 'Hotels',
    restaurants: 'Restaurants',
    hospitals: 'Hospitals',
    policeStations: 'Police Stations',
    travelAgencies: 'Travel Agencies',
    touristGuides: 'Tourist Guides',
    
    // Friends
    nearbyFriends: 'Nearby Friends',
    sendRequest: 'Send Request',
    acceptRequest: 'Accept Request',
    chatNow: 'Chat Now',
    shareLocation: 'Share Location',
    
    // Snap
    emergencySnap: 'Emergency Snap',
    shareSnap: 'Share Snap',
    sendToContacts: 'Send to Emergency Contacts',
    
    // SOS
    sos: 'SOS',
    emergency: 'Emergency',
    callForHelp: 'Call for Help',
    
    // Settings
    settings: 'Settings',
    darkMode: 'Dark Mode',
    language: 'Language',
  },
  hi: {
    // Navigation
    home: 'होम',
    map: 'मैप',
    friends: 'मित्र',
    snap: 'स्नैप',
    
    // Auth
    signIn: 'साइन इन',
    signUp: 'साइन अप',
    username: 'उपयोगकर्ता नाम',
    password: 'पासवर्ड',
    login: 'लॉगिन',
    register: 'पंजीकरण',
    
    // Home
    welcome: 'ट्रैवल सेवियर्स में आपका स्वागत है',
    stayafe: 'यात्रा के दौरान सुरक्षित रहें',
    needHelp: 'मदद चाहिए?',
    emergencySupport: '24/7 आपातकालीन सहायता',
    
    // Map
    nearbyPlaces: 'नजदीकी स्थान',
    hotels: 'होटल',
    restaurants: 'रेस्टोरेंट',
    hospitals: 'अस्पताल',
    policeStations: 'पुलिस स्टेशन',
    travelAgencies: 'ट्रैवल एजेंसी',
    touristGuides: 'टूरिस्ट गाइड',
    
    // Friends
    nearbyFriends: 'नजदीकी मित्र',
    sendRequest: 'अनुरोध भेजें',
    acceptRequest: 'अनुरोध स्वीकार करें',
    chatNow: 'अभी चैट करें',
    shareLocation: 'स्थान साझा करें',
    
    // Snap
    emergencySnap: 'आपातकालीन स्नैप',
    shareSnap: 'स्नैप साझा करें',
    sendToContacts: 'आपातकालीन संपर्कों को भेजें',
    
    // SOS
    sos: 'एसओएस',
    emergency: 'आपातकाल',
    callForHelp: 'मदद के लिए कॉल करें',
    
    // Settings
    settings: 'सेटिंग्स',
    darkMode: 'डार्क मोड',
    language: 'भाषा',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};