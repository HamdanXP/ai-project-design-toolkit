
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/useMobile";
import { useEffect, useRef } from "react";
import { ProjectPhase } from "@/types/project";
import { SidebarToggleButton } from "./SidebarToggleButton";
import { PhaseItem } from "./PhaseItem";

type ProjectBlueprintSidebarProps = {
  phases: ProjectPhase[];
  activePhase: string;
  setActivePhase: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
};

export const ProjectBlueprintSidebar = ({
  phases,
  activePhase,
  setActivePhase,
  isOpen,
  onToggle,
}: ProjectBlueprintSidebarProps) => {
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);

  const getStatusColor = (status: ProjectPhase["status"]) => {
    switch (status) {
      case "completed":
        return "bg-emerald-500";
      case "in-progress":
        return "bg-primary";
      default:
        return "bg-muted";
    }
  };

  // Handle touch swipe to close sidebar on mobile
  useEffect(() => {
    if (!isMobile || !containerRef.current) return;
    
    let touchStartX: number;
    
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartX || !isOpen) return;
      
      const touchX = e.touches[0].clientX;
      const diff = touchStartX - touchX;
      
      // If swiped left more than 50px, close the sidebar
      if (diff > 50) {
        onToggle();
        touchStartX = 0;
      }
    };
    
    const element = containerRef.current;
    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchmove', handleTouchMove);
    
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isMobile, isOpen, onToggle]);

  // On mobile, don't render anything if sidebar is closed (the toggle button is in the header)
  if (isMobile && !isOpen) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "transition-all duration-300 ease-in-out bg-card border-r border-border h-full z-10",
        isMobile ? (isOpen ? "fixed top-16 left-0 bottom-0 w-[250px]" : "hidden") : "relative",
        !isMobile && (isOpen ? "w-[250px]" : "w-[60px]")
      )}
    >
      <div className="p-4 flex justify-between items-center border-b border-border">
        <h2 className={cn("font-medium text-foreground", !isOpen && !isMobile ? "hidden" : "block")}>Project Phases</h2>
        {/* Only show the sidebar toggle on desktop */}
        {!isMobile && (
          <SidebarToggleButton isOpen={isOpen} onToggle={onToggle} />
        )}
      </div>
      <div className="overflow-y-auto p-2 h-[calc(100%-56px)]">
        {phases.map((phase) => (
          <PhaseItem
            key={`${phase.id}-${phase.status}-${phase.progress}`}
            phase={phase}
            isActive={activePhase === phase.id}
            isOpen={isOpen}
            isMobile={isMobile}
            onSelect={() => setActivePhase(phase.id)}
            getStatusColor={getStatusColor}
          />
        ))}
      </div>
    </div>
  );
};
