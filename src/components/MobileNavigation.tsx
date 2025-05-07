
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Layers, PencilRuler, FolderOpen, Menu } from "lucide-react";
import { 
  Drawer, 
  DrawerClose, 
  DrawerContent, 
  DrawerTrigger 
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

// Reuse the same navigation items to maintain consistency
const navigationItems = [
  {
    title: "Home",
    href: "/",
    icon: Home,
    description: "Return to the homepage",
  },
  {
    title: "My Projects",
    href: "/my-projects",
    icon: FolderOpen,
    description: "View and manage your projects",
  },
  {
    title: "Create Project",
    href: "/project-blueprint",
    icon: PencilRuler,
    description: "Start designing a new AI project",
  },
  {
    title: "FAQ",
    href: "/faq",
    icon: Layers,
    description: "Frequently asked questions",
  },
];

export function MobileNavigation() {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu className="h-5 w-5" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="p-4">
          <div className="flex flex-col gap-2">
            {navigationItems.map((item) => (
              <DrawerClose key={item.href} asChild>
                <Link to={item.href}>
                  <Button 
                    variant={isActive(item.href) ? "default" : "ghost"} 
                    className="w-full justify-start gap-3"
                  >
                    <item.icon className="h-4 w-4" />
                    {item.title}
                  </Button>
                </Link>
              </DrawerClose>
            ))}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
