
import { useState } from "react";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";

interface TopBarProps {
  // In a real app, this would come from authentication
  user?: {
    name: string;
    image?: string;
  };
  onSignIn?: () => void;
  onSignUp?: () => void;
}

export function TopBar({ user, onSignIn, onSignUp }: TopBarProps) {
  // For demo purposes - toggling user state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mockUser, setMockUser] = useState<{ name: string; image?: string } | undefined>(user);

  const handleSignIn = () => {
    // In a real app, this would redirect to sign in page or open a modal
    // For demo, we'll just toggle the login state
    setIsLoggedIn(true);
    setMockUser({ name: "John Doe" });
    onSignIn?.();
  };

  const handleSignOut = () => {
    setIsLoggedIn(false);
    setMockUser(undefined);
  };

  return (
    <div className="topbar fixed top-0 left-0 right-0 z-50 h-16 px-4 flex justify-between items-center border-b border-border bg-background/80 backdrop-blur-md">
      <div className="flex items-center">
        {/* Logo - using a simple placeholder */}
        <div className="text-primary font-bold text-2xl flex items-center">
          <div className="mr-1 text-primary-foreground bg-primary rounded-md w-8 h-8 flex items-center justify-center">
            L
          </div>
          Lovable
        </div>
      </div>

      <div className="flex items-center gap-4">
        <ThemeSwitcher />

        {isLoggedIn && mockUser ? (
          <div className="flex items-center gap-3">
            <div className="text-sm font-medium text-foreground">
              {mockUser.name}
            </div>
            <Avatar 
              className="cursor-pointer h-10 w-10 border-2 border-primary/50 hover:border-primary transition-all"
              onClick={handleSignOut}
            >
              <AvatarImage src={mockUser.image} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                <User size={20} />
              </AvatarFallback>
            </Avatar>
          </div>
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
              onClick={() => {
                onSignUp?.();
                handleSignIn();
              }}
            >
              Sign up
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
