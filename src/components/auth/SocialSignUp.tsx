
import { Button } from "@/components/ui/button";
import { Mail, Github, Globe } from "lucide-react";

interface SocialSignUpProps {
  onSocialSignUp: (provider: string) => void;
}

export const SocialSignUp = ({ onSocialSignUp }: SocialSignUpProps) => {
  return (
    <div className="grid grid-cols-1 gap-3">
      <Button 
        variant="outline" 
        className="flex items-center gap-2"
        onClick={() => onSocialSignUp("Google")}
      >
        <Mail className="h-4 w-4" />
        <span>Sign up with Google</span>
      </Button>
      <Button 
        variant="outline" 
        className="flex items-center gap-2"
        onClick={() => onSocialSignUp("GitHub")}
      >
        <Github className="h-4 w-4" />
        <span>Sign up with GitHub</span>
      </Button>
      <Button 
        variant="outline" 
        className="flex items-center gap-2"
        onClick={() => onSocialSignUp("Facebook")}
      >
        <Globe className="h-4 w-4" />
        <span>Sign up with Facebook</span>
      </Button>
    </div>
  );
};
