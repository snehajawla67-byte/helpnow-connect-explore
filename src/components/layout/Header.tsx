import React from 'react';
import { Settings, Shield, Sun, Moon, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import SOSButton from '@/components/sos/SOSButton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { user, logout } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-200 dark:bg-gray-900/95 dark:border-gray-700 z-40">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-2">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-bold text-gradient-travel">Travel Saviours</h1>
        </div>

        <div className="flex items-center space-x-2">
          {/* Emergency SOS Button */}
          <SOSButton />
          
          {/* Language Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            className="p-2"
          >
            <Globe className="h-5 w-5" />
            <span className="ml-1 text-sm font-medium">
              {language === 'en' ? 'हि' : 'EN'}
            </span>
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="p-2"
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>

          {/* Settings Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="p-2">
                <Settings className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5 text-sm font-medium">
                {user?.username || 'Guest'}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={toggleTheme}>
                {theme === 'light' ? <Moon className="mr-2 h-4 w-4" /> : <Sun className="mr-2 h-4 w-4" />}
                {t('darkMode')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}>
                <Globe className="mr-2 h-4 w-4" />
                {t('language')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {user && (
                <DropdownMenuItem onClick={logout} className="text-red-600">
                  Sign Out
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;