import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Map, Users, Camera } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Navigation = () => {
  const { t } = useLanguage();

  const navItems = [
    { path: '/', icon: Home, label: t('home') },
    { path: '/map', icon: Map, label: t('map') },
    { path: '/friends', icon: Users, label: t('friends') },
    { path: '/snap', icon: Camera, label: t('snap') },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 dark:bg-gray-900/95 dark:border-gray-700 z-50">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''} min-w-0 flex-1`
            }
          >
            <item.icon className="h-6 w-6 mb-1" />
            <span className="text-xs font-medium truncate">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default Navigation;