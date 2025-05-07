
import { TopBar } from "@/components/TopBar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

const Settings = () => {
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  
  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <div className="container mx-auto px-4 py-12 pt-24">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-8">Settings</h1>
          
          <div className="space-y-8">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">Preferences</h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Notifications</h3>
                      <p className="text-sm text-muted-foreground">Receive notifications about your projects</p>
                    </div>
                    <Switch 
                      checked={notifications} 
                      onCheckedChange={setNotifications} 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Email Updates</h3>
                      <p className="text-sm text-muted-foreground">Receive email updates about new features</p>
                    </div>
                    <Switch 
                      checked={emailUpdates} 
                      onCheckedChange={setEmailUpdates} 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Dark Mode</h3>
                      <p className="text-sm text-muted-foreground">Use dark theme</p>
                    </div>
                    <Switch 
                      checked={darkMode} 
                      onCheckedChange={setDarkMode} 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">Account</h2>
                <div className="space-y-6">
                  <div>
                    <Button variant="outline" className="w-full justify-start">
                      Change Password
                    </Button>
                  </div>
                  
                  <div>
                    <Button variant="outline" className="w-full justify-start">
                      Connected Accounts
                    </Button>
                  </div>
                  
                  <div>
                    <Button variant="outline" className="w-full justify-start">
                      Billing & Subscriptions
                    </Button>
                  </div>
                  
                  <div>
                    <Button variant="destructive" className="w-full">
                      Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
