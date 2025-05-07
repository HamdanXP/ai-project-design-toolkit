
import { TopBar } from "@/components/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

const Profile = () => {
  const [name, setName] = useState("John Doe");
  const [email, setEmail] = useState("john.doe@example.com");
  const [bio, setBio] = useState("I build amazing web applications with Lovable!");
  const [isEditing, setIsEditing] = useState(false);

  const handleSaveChanges = () => {
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully",
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <div className="container mx-auto px-4 pt-20 md:pt-24 pb-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold mb-6">My Profile</h1>
          
          <Card className="mb-6 shadow-card-light dark:shadow-card-dark">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col items-center gap-3">
                  <Avatar className="h-24 w-24 border-2 border-primary/50">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                      <User size={38} />
                    </AvatarFallback>
                  </Avatar>
                  <Button variant="outline" size="sm">
                    Change Avatar
                  </Button>
                </div>
                
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name</label>
                    {isEditing ? (
                      <Input 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                      />
                    ) : (
                      <div className="text-base">{name}</div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    {isEditing ? (
                      <Input 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                      />
                    ) : (
                      <div className="text-base">{email}</div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Bio</label>
                    {isEditing ? (
                      <Input 
                        value={bio} 
                        onChange={(e) => setBio(e.target.value)} 
                      />
                    ) : (
                      <div className="text-base">{bio}</div>
                    )}
                  </div>
                  
                  <div className="pt-2">
                    {isEditing ? (
                      <div className="flex gap-3">
                        <Button onClick={handleSaveChanges}>Save Changes</Button>
                        <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                      </div>
                    ) : (
                      <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
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
