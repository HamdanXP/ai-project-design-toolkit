
import { useState } from "react";
import { TopBar } from "@/components/TopBar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Settings = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [marketingEmails, setMarketingEmails] = useState(true);
  const [projectUpdates, setProjectUpdates] = useState(true);

  const handleSaveSettings = () => {
    toast({
      title: "Settings saved",
      description: "Your settings have been updated successfully",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <div className="container mx-auto px-4 pt-20 md:pt-24 pb-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold mb-6">Settings</h1>
          
          <Tabs defaultValue="appearance" className="mb-6">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
            </TabsList>
            
            <TabsContent value="appearance">
              <Card className="shadow-card-light dark:shadow-card-dark">
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>
                    Customize how Lovable looks and feels
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="dark-mode" className="flex flex-col">
                      <span>Dark Mode</span>
                      <span className="text-sm text-muted-foreground">
                        Enable dark mode for a better night time experience
                      </span>
                    </Label>
                    <Switch
                      id="dark-mode"
                      checked={darkMode}
                      onCheckedChange={setDarkMode}
                    />
                  </div>
                  
                  <Button onClick={handleSaveSettings}>Save Appearance Settings</Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="notifications">
              <Card className="shadow-card-light dark:shadow-card-dark">
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Manage how you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-notifications" className="flex flex-col">
                        <span>Email Notifications</span>
                        <span className="text-sm text-muted-foreground">
                          Receive emails about your activity
                        </span>
                      </Label>
                      <Switch
                        id="email-notifications"
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="push-notifications" className="flex flex-col">
                        <span>Push Notifications</span>
                        <span className="text-sm text-muted-foreground">
                          Receive push notifications on your device
                        </span>
                      </Label>
                      <Switch
                        id="push-notifications"
                        checked={pushNotifications}
                        onCheckedChange={setPushNotifications}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="marketing-emails" className="flex flex-col">
                        <span>Marketing Emails</span>
                        <span className="text-sm text-muted-foreground">
                          Receive emails about new features and offers
                        </span>
                      </Label>
                      <Switch
                        id="marketing-emails"
                        checked={marketingEmails}
                        onCheckedChange={setMarketingEmails}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="project-updates" className="flex flex-col">
                        <span>Project Updates</span>
                        <span className="text-sm text-muted-foreground">
                          Get notified about updates to your projects
                        </span>
                      </Label>
                      <Switch
                        id="project-updates"
                        checked={projectUpdates}
                        onCheckedChange={setProjectUpdates}
                      />
                    </div>
                  </div>
                  
                  <Button onClick={handleSaveSettings}>Save Notification Settings</Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="account">
              <Card className="shadow-card-light dark:shadow-card-dark">
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>
                    Manage your account details and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <Button variant="outline" className="w-full sm:w-auto">
                      Change Password
                    </Button>
                    
                    <Button variant="outline" className="w-full sm:w-auto">
                      Connect Social Accounts
                    </Button>
                    
                    <Button variant="destructive" className="w-full sm:w-auto">
                      Delete Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Settings;
