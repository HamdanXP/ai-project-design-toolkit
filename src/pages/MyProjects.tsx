import { useState, useEffect } from "react";
import { TopBar } from "@/components/TopBar";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { BackButton } from "@/components/BackButton";
import { Footer } from "@/components/Footer";

const MyProjects = () => {
  const navigate = useNavigate();
  
  // Example of projects data - would come from an API in a real app
  const [projects] = useState([
    { id: 1, name: "Portfolio Website", image: "https://via.placeholder.com/300x200/3B82F6/FFFFFF?text=Portfolio" },
    { id: 2, name: "Recipe Finder App", image: "https://via.placeholder.com/300x200/10B981/FFFFFF?text=Recipes" },
    { id: 3, name: "Task Manager", image: "https://via.placeholder.com/300x200/3B82F6/FFFFFF?text=Tasks" },
    { id: 4, name: "Weather Dashboard", image: "https://via.placeholder.com/300x200/10B981/FFFFFF?text=Weather" },
    { id: 5, name: "E-commerce Store", image: "https://via.placeholder.com/300x200/3B82F6/FFFFFF?text=E-commerce" },
    { id: 6, name: "Blog Platform", image: "https://via.placeholder.com/300x200/10B981/FFFFFF?text=Blog" },
    { id: 7, name: "Chat Application", image: "https://via.placeholder.com/300x200/3B82F6/FFFFFF?text=Chat" },
    { id: 8, name: "Analytics Dashboard", image: "https://via.placeholder.com/300x200/10B981/FFFFFF?text=Analytics" },
  ]);

  const handleProjectClick = (projectId: number) => {
    // Use the correct path format to match the route in App.tsx
    navigate(`/project/${projectId}`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar />
      <div className="container mx-auto px-4 py-12 pt-24 flex-grow">
        <div className="flex items-center mb-8">
          <BackButton />
          <h1 className="text-3xl font-bold text-foreground ml-3">My Projects</h1>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* "Create Project" card removed */}
          
          {/* Existing Projects */}
          {projects.map((project) => (
            <div 
              key={project.id}
              className="rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-all cursor-pointer bg-card shadow-card-light dark:shadow-card-dark"
              onClick={() => handleProjectClick(project.id)}
            >
              <img 
                src={project.image} 
                alt={project.name} 
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-medium text-foreground">{project.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MyProjects;
