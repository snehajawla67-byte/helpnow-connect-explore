import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Header from "@/components/layout/Header";
import Navigation from "@/components/layout/Navigation";
import Home from "@/pages/Home";
import MapPage from "@/pages/MapPage";
import Friends from "@/pages/Friends";
import Snap from "@/pages/Snap";
import NotFound from "./pages/NotFound";
import { Toaster as HotToaster } from "react-hot-toast";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <TooltipProvider>
            <BrowserRouter>
              <div className="min-h-screen bg-background">
                <Header />
                
                <main className="pb-20">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/map" element={<MapPage />} />
                    <Route path="/friends" element={<Friends />} />
                    <Route path="/snap" element={<Snap />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>

                <Navigation />
                
                <Toaster />
                <Sonner />
                <HotToaster 
                  position="top-center"
                  toastOptions={{
                    duration: 3000,
                    style: {
                      background: 'hsl(var(--card))',
                      color: 'hsl(var(--foreground))',
                      border: '1px solid hsl(var(--border))',
                    },
                  }}
                />
              </div>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
