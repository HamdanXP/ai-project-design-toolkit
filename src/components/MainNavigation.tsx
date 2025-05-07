
import { Link, useLocation } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { Home, Layers, PencilRuler, FolderOpen } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

// Navigation items definition
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

export function MainNavigation({ className }: { className?: string }) {
  const location = useLocation();
  const isMobile = useIsMobile();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  if (isMobile) {
    return null; // Mobile navigation will be handled by MobileNavigation in TopBar
  }
  
  return (
    <NavigationMenu className={cn("mx-auto", className)}>
      <NavigationMenuList>
        {navigationItems.map((item) => (
          <NavigationMenuItem key={item.href}>
            <Link to={item.href} className={cn(
              navigationMenuTriggerStyle(),
              "flex items-center gap-2",
              isActive(item.href) && "bg-accent/50",
            )}>
              <item.icon className="h-4 w-4" />
              <span>{item.title}</span>
            </Link>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
