
import { TopBar } from "@/components/TopBar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BackButton } from "@/components/BackButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { 
  BellRing, 
  Shield, 
  Globe, 
  Palette, 
  UserCircle, 
  LogOut,
  User,
  AtSign,
  Camera,
  Check
} from "lucide-react";

const Settings = () => {
  const [email, setEmail] = useState("johndoe@example.com");
  const [name, setName] = useState("John Doe");
  const [username, setUsername] = useState("johndoe");
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    marketingEmails: true,
    activityDigest: false,
    securityAlerts: true,
  });
  const [appearanceSettings, setAppearanceSettings] = useState({
    systemTheme: true,
    animationReduced: false,
    highContrast: false,
  });
  
  const updateNotificationSetting = (key: keyof typeof notificationSettings) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  const updateAppearanceSetting = (key: keyof typeof appearanceSettings) => {
    setAppearanceSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <div className="container mx-auto px-4 pt-20 md:pt-24 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <BackButton variant="home" label="Home" />
            <h1 className="text-2xl md:text-3xl font-bold ml-3">Settings</h1>
          </div>
          
          <Tabs defaultValue="account" className="w-full">
            <div className="mb-6 border-b">
              <TabsList className="bg-transparent -mb-px">
                <TabsTrigger 
                  value="account" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none"
                >
                  Account
                </TabsTrigger>
                <TabsTrigger 
                  value="notifications" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none"
                >
                  Notifications
                </TabsTrigger>
                <TabsTrigger 
                  value="appearance" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none"
                >
                  Appearance
                </TabsTrigger>
                <TabsTrigger 
                  value="security" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none"
                >
                  Security
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="account" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCircle className="w-5 h-5" />
                    Profile Information
                  </CardTitle>
                  <CardDescription>
                    Update your profile details and personal information.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-1/3 flex flex-col items-center justify-start">
                      <div className="relative group">
                        <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center overflow-hidden border-4 border-background shadow-lg">
                          <User className="w-24 h-24 text-muted-foreground/30" />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-black/60 w-full h-full rounded-full flex items-center justify-center">
                            <Button variant="ghost" size="icon" className="text-white">
                              <Camera className="w-6 h-6" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground mt-3">
                        Click to change profile photo
                      </span>
                    </div>
                    
                    <div className="md:w-2/3 space-y-4">
                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                              id="name" 
                              value={name} 
                              onChange={e => setName(e.target.value)} 
                              className="pl-10"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="username">Username</Label>
                          <div className="relative">
                            <AtSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                              id="username" 
                              value={username} 
                              onChange={e => setUsername(e.target.value)} 
                              className="pl-10"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <div className="relative">
                            <AtSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                              id="email" 
                              type="email" 
                              value={email} 
                              onChange={e => setEmail(e.target.value)} 
                              className="pl-10"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button className="px-6">
                          <Check className="mr-2 h-4 w-4" />
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-destructive/30">
                <CardHeader>
                  <CardTitle className="text-destructive flex items-center">
                    <LogOut className="w-5 h-5 mr-2" />
                    Delete Account
                  </CardTitle>
                  <CardDescription>
                    Permanently delete your account and all your data.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-muted-foreground">
                    Once your account is deleted, all of your data will be permanently removed. This action cannot be undone.
                  </p>
                  <Button variant="destructive">Delete Account</Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BellRing className="w-5 h-5" />
                    Notification Preferences
                  </CardTitle>
                  <CardDescription>
                    Manage how we notify you about activity and updates.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <Label className="text-base">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive updates via email.
                        </p>
                      </div>
                      <Switch 
                        checked={notificationSettings.emailNotifications}
                        onCheckedChange={() => updateNotificationSetting('emailNotifications')}
                      />
                    </div>
                    
                    <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <Label className="text-base">Push Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications on your device.
                        </p>
                      </div>
                      <Switch 
                        checked={notificationSettings.pushNotifications}
                        onCheckedChange={() => updateNotificationSetting('pushNotifications')}
                      />
                    </div>
                    
                    <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <Label className="text-base">Marketing Emails</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive marketing and promotional emails.
                        </p>
                      </div>
                      <Switch 
                        checked={notificationSettings.marketingEmails}
                        onCheckedChange={() => updateNotificationSetting('marketingEmails')}
                      />
                    </div>
                    
                    <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <Label className="text-base">Weekly Activity Digest</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive a summary of your weekly activity.
                        </p>
                      </div>
                      <Switch 
                        checked={notificationSettings.activityDigest}
                        onCheckedChange={() => updateNotificationSetting('activityDigest')}
                      />
                    </div>
                    
                    <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <Label className="text-base">Security Alerts</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive alerts about security concerns.
                        </p>
                      </div>
                      <Switch 
                        checked={notificationSettings.securityAlerts}
                        onCheckedChange={() => updateNotificationSetting('securityAlerts')}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="appearance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Appearance Settings
                  </CardTitle>
                  <CardDescription>
                    Customize how the application looks on your device.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <Label className="text-base">Use System Theme</Label>
                        <p className="text-sm text-muted-foreground">
                          Match the application theme to your system preferences.
                        </p>
                      </div>
                      <Switch 
                        checked={appearanceSettings.systemTheme}
                        onCheckedChange={() => updateAppearanceSetting('systemTheme')}
                      />
                    </div>
                    
                    <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <Label className="text-base">Reduced Animations</Label>
                        <p className="text-sm text-muted-foreground">
                          Minimize motion effects throughout the application.
                        </p>
                      </div>
                      <Switch 
                        checked={appearanceSettings.animationReduced}
                        onCheckedChange={() => updateAppearanceSetting('animationReduced')}
                      />
                    </div>
                    
                    <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <Label className="text-base">High Contrast Mode</Label>
                        <p className="text-sm text-muted-foreground">
                          Increase contrast for better readability.
                        </p>
                      </div>
                      <Switch 
                        checked={appearanceSettings.highContrast}
                        onCheckedChange={() => updateAppearanceSetting('highContrast')}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Security Settings
                  </CardTitle>
                  <CardDescription>
                    Manage your account security and privacy.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button variant="outline" className="w-full justify-start">
                      Change Password
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Enable Two-Factor Authentication
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Manage Connected Devices
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Download Personal Data
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
