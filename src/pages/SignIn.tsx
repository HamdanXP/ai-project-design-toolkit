
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Mail, Github, Globe } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useSignIn } from "@/hooks/useSignIn";

const SignIn = () => {
  const {
    email,
    password,
    isLoading,
    handleEmailChange,
    handlePasswordChange,
    handleSubmit,
    handleSocialSignIn,
    handleForgotPassword,
    handleSignUp,
  } = useSignIn();

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <div className="container mx-auto px-4 pt-20 md:pt-24 pb-8">
        <div className="max-w-md mx-auto">
          <Card className="shadow-card-light dark:shadow-card-dark">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
              <CardDescription>Sign in to your Lovable account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2"
                    onClick={() => handleSocialSignIn("Google")}
                  >
                    <Mail className="h-4 w-4" />
                    <span>Sign in with Google</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2"
                    onClick={() => handleSocialSignIn("GitHub")}
                  >
                    <Github className="h-4 w-4" />
                    <span>Sign in with GitHub</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2"
                    onClick={() => handleSocialSignIn("Facebook")}
                  >
                    <Globe className="h-4 w-4" />
                    <span>Sign in with Facebook</span>
                  </Button>
                </div>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-card px-2 text-xs text-muted-foreground">
                      OR SIGN IN WITH EMAIL
                    </span>
                  </div>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
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
                    <div className="flex justify-between items-center">
                      <label htmlFor="password" className="text-sm font-medium">
                        Password
                      </label>
                      <Button 
                        variant="link" 
                        className="text-xs p-0 h-auto" 
                        onClick={handleForgotPassword}
                      >
                        Forgot password?
                      </Button>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign in"}
                  </Button>
                </form>
              </div>
            </CardContent>
            <CardFooter className="justify-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Button variant="link" className="p-0 h-auto" onClick={handleSignUp}>
                  Sign up
                </Button>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SignIn;

