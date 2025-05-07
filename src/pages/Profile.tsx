
import { TopBar } from "@/components/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [name, setName] = useState("John Doe");
  const [email, setEmail] = useState("john.doe@example.com");
  const [bio, setBio] = useState("I build amazing web applications with Lovable!");
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  const handleSaveChanges = () => {
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully",
    });
    setIsEditing(false);
  };

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <div className="container mx-auto px-4 pt-20 md:pt-24 pb-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center mb-6">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleGoHome}
              className="mr-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold">My Profile</h1>
          </div>
          
          <Card className="mb-6 shadow-md border-opacity-50 overflow-hidden bg-card/50 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/5 pb-6">
              <CardTitle className="text-xl md:text-2xl">Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex flex-col items-center gap-4">
                  <Avatar className="h-32 w-32 border-2 border-primary/30 shadow-lg">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-primary/80 text-primary-foreground text-4xl">
                      <User size={48} />
                    </AvatarFallback>
                  </Avatar>
                  <Button variant="outline" size="sm" className="rounded-full px-6">
                    Change Avatar
                  </Button>
                </div>
                
                <div className="flex-1 space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name</label>
                    {isEditing ? (
                      <Input 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        className="border-primary/20 focus-visible:ring-primary/30"
                      />
                    ) : (
                      <div className="text-base font-medium bg-card/50 p-3 rounded-md border border-border/40">{name}</div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    {isEditing ? (
                      <Input 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                        className="border-primary/20 focus-visible:ring-primary/30" 
                      />
                    ) : (
                      <div className="text-base font-medium bg-card/50 p-3 rounded-md border border-border/40">{email}</div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Bio</label>
                    {isEditing ? (
                      <Textarea 
                        value={bio} 
                        onChange={(e) => setBio(e.target.value)}
                        className="min-h-[100px] border-primary/20 focus-visible:ring-primary/30" 
                      />
                    ) : (
                      <div className="text-base bg-card/50 p-3 rounded-md border border-border/40">{bio}</div>
                    )}
                  </div>
                  
                  <div className="pt-4">
                    {isEditing ? (
                      <div className="flex gap-3">
                        <Button onClick={handleSaveChanges} className="rounded-full px-6">Save Changes</Button>
                        <Button variant="outline" onClick={() => setIsEditing(false)} className="rounded-full px-6">Cancel</Button>
                      </div>
                    ) : (
                      <Button onClick={() => setIsEditing(true)} className="rounded-full px-6">Edit Profile</Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
