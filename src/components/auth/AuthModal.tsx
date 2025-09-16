import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, User, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import toast from 'react-hot-toast';

interface AuthModalProps {
  onClose?: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const { login, register } = useAuth();
  const { t } = useLanguage();
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [registerData, setRegisterData] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const success = await login(loginData.username, loginData.password);
      if (success) {
        toast.success('Login successful!');
        onClose?.();
      } else {
        toast.error('Invalid credentials');
      }
    } catch (error) {
      toast.error('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const success = await register(registerData.username, registerData.password);
      if (success) {
        toast.success('Registration successful!');
        onClose?.();
      } else {
        toast.error('Registration failed');
      }
    } catch (error) {
      toast.error('Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md animate-bounce-in">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl text-gradient-travel">Travel Saviours</CardTitle>
          <CardDescription>Join our safety community</CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">{t('signIn')}</TabsTrigger>
              <TabsTrigger value="register">{t('signUp')}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-username" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {t('username')}
                  </Label>
                  <Input
                    id="login-username"
                    type="text"
                    value={loginData.username}
                    onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                    placeholder="Enter your username"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    {t('password')}
                  </Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    placeholder="Enter your password"
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full btn-travel" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : t('login')}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register" className="space-y-4">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-username" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {t('username')}
                  </Label>
                  <Input
                    id="register-username"
                    type="text"
                    value={registerData.username}
                    onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                    placeholder="Choose a username"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-password" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    {t('password')}
                  </Label>
                  <Input
                    id="register-password"
                    type="password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    placeholder="Create a password"
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full btn-travel" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating account...' : t('register')}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="mt-4 text-center">
            <Button variant="ghost" onClick={onClose} className="text-sm">
              Continue as Guest
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthModal;