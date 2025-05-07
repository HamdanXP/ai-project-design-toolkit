
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
    <div className="topbar">
      <div className="flex items-center">
        {/* Logo - using a simple placeholder */}
        <div className="text-sidebar-primary font-bold text-2xl flex items-center">
          <div className="mr-1 text-white bg-sidebar-primary rounded-md w-8 h-8 flex items-center justify-center">
            L
          </div>
          Lovable
        </div>
      </div>

      <div className="flex items-center gap-4">
        <ThemeSwitcher />

        {isLoggedIn && mockUser ? (
          <div className="flex items-center gap-3">
            <div className="text-sm font-medium text-white">
              {mockUser.name}
            </div>
            <Avatar 
              className="cursor-pointer h-10 w-10 border-2 border-sidebar-primary/50 hover:border-sidebar-primary transition-all"
              onClick={handleSignOut}
            >
              <AvatarImage src={mockUser.image} />
              <AvatarFallback className="bg-sidebar-primary text-white">
                <User size={20} />
              </AvatarFallback>
            </Avatar>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              className="topbar-button text-white"
              onClick={handleSignIn}
            >
              Sign in
            </Button>
            <Button 
              className="rounded-full bg-white text-black hover:bg-gray-100"
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
