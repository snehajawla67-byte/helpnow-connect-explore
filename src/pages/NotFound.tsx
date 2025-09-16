import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 flex items-center justify-center px-4">
      <Card className="card-feature max-w-md w-full text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Shield className="h-16 w-16 text-primary animate-float" />
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-emergency rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">!</span>
              </div>
            </div>
          </div>
          <CardTitle className="text-4xl font-bold text-gradient-travel mb-2">404</CardTitle>
          <CardDescription className="text-lg">
            Oops! This path doesn't exist
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The page you're looking for might have been moved or doesn't exist.
          </p>
          
          <div className="space-y-2">
            <Button asChild className="btn-travel w-full">
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                Go to Home
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full">
              <Link to="/map">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Explore Map
              </Link>
            </Button>
          </div>
          
          <div className="mt-6 p-3 bg-primary/10 rounded-lg">
            <p className="text-xs text-muted-foreground">
              Need help? Use the SOS button for emergencies or navigate using the bottom menu.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
