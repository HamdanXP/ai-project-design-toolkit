
import { useState, useEffect } from "react";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  Settings, 
  HelpCircle, 
  LogOut, 
  UserCircle, 
  Menu,
  Layers
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/useMobile";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { toast } from "@/hooks/useToast";

interface TopBarProps {
  // In a real app, this would come from authentication
  user?: {
    name: string;
    image?: string;
  };
  onSignIn?: () => void;
  onSignUp?: () => void;
}

export function TopBar({ onSignIn, onSignUp }: TopBarProps) {
  // State for authentication
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mockUser, setMockUser] = useState<{ name: string; email?: string; image?: string } | undefined>(undefined);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Check localStorage for user data on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem("lovableUser");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        if (userData && userData.isLoggedIn) {
          setIsLoggedIn(true);
          setMockUser(userData);
        }
      } catch (error) {
        console.error("Error parsing user data from localStorage", error);
      }
    }
  }, []);

  const handleSignIn = () => {
    navigate("/sign-in");
  };

  const handleSignUp = () => {
    navigate("/sign-up");
  };

  const handleSignOut = () => {
    // Clear user data from localStorage
    localStorage.removeItem("lovableUser");
    setIsLoggedIn(false);
    setMockUser(undefined);
    
    toast({
      title: "Signed out",
      description: "You have been successfully signed out",
    });
    
    navigate("/");
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  // For demo purposes - if user logs in from sign-in page
  const mockSignIn = (userData?: any) => {
    setIsLoggedIn(true);
    setMockUser(userData || { name: "John Doe" });
  };

  // Expose the mockSignIn function to window for demo purposes
  // This allows the sign-in page to simulate a successful login
  if (typeof window !== 'undefined') {
    (window as any).mockSignIn = mockSignIn;
  }

  return (
    <div className="topbar fixed top-0 left-0 right-0 z-50 h-16 px-4 flex justify-between items-center border-b border-border bg-background/80 backdrop-blur-md">
      <div className="flex items-center">
        {/* Updated Logo */}
        <div className="text-primary font-bold text-lg sm:text-2xl flex items-center" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <div className="mr-1 text-primary-foreground bg-primary rounded-md w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center">
            <Layers size={isMobile ? 16 : 20} />
          </div>
          <span className="hidden sm:inline">APDT</span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <ThemeSwitcher />

        {isLoggedIn && mockUser ? (
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="text-sm font-medium text-foreground hidden sm:block">
              {mockUser.name}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar 
                  className="cursor-pointer h-8 w-8 sm:h-10 sm:w-10 border-2 border-primary/50 hover:border-primary transition-all"
                >
                  <AvatarImage src={mockUser.image} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <User size={isMobile ? 16 : 20} />
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleNavigate('/profile')} className="cursor-pointer">
                  <UserCircle className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavigate('/settings')} className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavigate('/faq')} className="cursor-pointer">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>FAQ</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <>
            {isMobile ? (
              <Drawer>
                <DrawerTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </DrawerTrigger>
                <DrawerContent>
                  <div className="p-4 flex flex-col gap-2">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start"
                      onClick={handleSignIn}
                    >
                      Sign in
                    </Button>
                    <Button 
                      className="w-full"
                      onClick={handleSignUp}
                    >
                      Sign up
                    </Button>
                  </div>
                </DrawerContent>
              </Drawer>
            ) : (
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  className="topbar-button"
                  onClick={handleSignIn}
                >
                  Sign in
                </Button>
                <Button 
                  className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={handleSignUp}
                >
                  Sign up
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
