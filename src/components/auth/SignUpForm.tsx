
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface SignUpFormProps {
  onSubmit: (name: string, email: string, password: string, agreedToTerms: boolean) => void;
  isLoading: boolean;
}

export const SignUpForm = ({ onSubmit, isLoading }: SignUpFormProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleTermsChange = (checked: boolean) => {
    setAgreedToTerms(checked);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(name, email, password, agreedToTerms);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Full Name
        </label>
        <Input
          id="name"
          type="text"
          placeholder="John Doe"
          value={name}
          onChange={handleNameChange}
          required
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={handleEmailChange}
          required
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <Input
          id="password"
          type="password"
          placeholder="Create a secure password"
          value={password}
          onChange={handlePasswordChange}
          required
        />
      </div>
      <div className="flex items-start space-x-2">
        <Checkbox 
          id="terms" 
          checked={agreedToTerms}
          onCheckedChange={handleTermsChange}
        />
        <label
          htmlFor="terms"
          className="text-sm leading-tight text-muted-foreground"
        >
          I agree to the{" "}
          <Button variant="link" className="p-0 h-auto text-sm">
            Terms of Service
          </Button>{" "}
          and{" "}
          <Button variant="link" className="p-0 h-auto text-sm">
            Privacy Policy
          </Button>
        </label>
      </div>
      <Button 
        type="submit" 
        className="w-full"
        disabled={isLoading || !agreedToTerms}
      >
        {isLoading ? "Creating Account..." : "Create Account"}
      </Button>
    </form>
  );
};
