import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { 
  Home, 
  Mic, 
  Clock, 
  BookOpen, 
  Scale, 
  Settings, 
  LogOut,
  Shield,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';

interface LayoutProps {
  children: ReactNode;
  onLogout: () => void;
}

export default function Layout({ children, onLogout }: LayoutProps) {
  const location = useLocation();
  const { toast } = useToast();
  
  const isOnline = navigator.onLine;

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Record', href: '/record', icon: Mic },
    { name: 'Timeline', href: '/timeline', icon: Clock },
    { name: 'Resources', href: '/resources', icon: BookOpen },
    { name: 'Legal Tools', href: '/legal', icon: Scale },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    toast({
      title: "Logged out",
      description: "You have been securely logged out.",
    });
    onLogout();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary">ChildFirst</h1>
                <p className="text-xs text-muted-foreground">Victoria, Australia</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {isOnline ? (
                  <Wifi className="w-4 h-4 text-success" />
                ) : (
                  <WifiOff className="w-4 h-4 text-muted-foreground" />
                )}
                <span className="text-xs text-muted-foreground">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-card border-r border-border min-h-[calc(100vh-4rem)] p-4">
          <div className="space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
          
          {/* Quick Record Button */}
          <div className="mt-8 p-4 bg-accent/10 rounded-lg border border-accent/20">
            <h3 className="text-sm font-semibold text-accent mb-2">Quick Access</h3>
            <Link to="/record">
              <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                <Mic className="w-4 h-4 mr-2" />
                Start Recording
              </Button>
            </Link>
          </div>
          
          {/* Privacy Notice */}
          <div className="mt-6 p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground text-center">
              🔒 All data stored locally on your device for maximum privacy
            </p>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}