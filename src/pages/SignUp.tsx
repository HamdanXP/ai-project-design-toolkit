
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SocialSignUp } from "@/components/auth/SocialSignUp";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { useSignUp } from "@/hooks/use-signup";

const SignUp = () => {
  const { isLoading, handleSubmit, handleSocialSignUp, handleSignIn } = useSignUp();

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <div className="container mx-auto px-4 pt-20 md:pt-24 pb-8">
        <div className="max-w-md mx-auto">
          <Card className="shadow-card-light dark:shadow-card-dark">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
              <CardDescription>Sign up for a Lovable account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <SocialSignUp onSocialSignUp={handleSocialSignUp} />
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-card px-2 text-xs text-muted-foreground">
                      OR SIGN UP WITH EMAIL
                    </span>
                  </div>
                </div>
                
                <SignUpForm onSubmit={handleSubmit} isLoading={isLoading} />
              </div>
            </CardContent>
            <CardFooter className="justify-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Button variant="link" className="p-0 h-auto" onClick={handleSignIn}>
                  Sign in
                </Button>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
