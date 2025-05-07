import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

const HomePage = () => {
  const navigate = useNavigate();
  
  // Example of projects data - would come from an API in a real app
  const [projects] = useState([
    { id: 1, name: "Portfolio Website", image: "https://via.placeholder.com/300x200/3B82F6/FFFFFF?text=Portfolio" },
    { id: 2, name: "Recipe Finder App", image: "https://via.placeholder.com/300x200/10B981/FFFFFF?text=Recipes" },
    { id: 3, name: "Task Manager", image: "https://via.placeholder.com/300x200/3B82F6/FFFFFF?text=Tasks" },
    { id: 4, name: "Weather Dashboard", image: "https://via.placeholder.com/300x200/10B981/FFFFFF?text=Weather" },
  ]);

  const [suggestions] = useState([
    "Kanban board",
    "Startup dashboard", 
    "Music player",
    "3D product viewer"
  ]);

  const handleCreateProject = () => {
    navigate("/project-blueprint");
  };

  const handleViewAll = () => {
    navigate("/my-projects");
  };

  return (
    <div className="pt-20 min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center mb-16 animate-fade">
          <h1 className="text-5xl font-bold mb-6 text-foreground">
            Build something <span className="text-primary">Lovable</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Idea to app in seconds, with your personal full stack engineer
          </p>

          <Card className="mb-8 shadow-card-light dark:shadow-card-dark">
            <CardContent className="p-6">
              <div className="text-left text-foreground mb-2 flex items-center">
                <div className="flex-grow">
                  <input 
                    type="text" 
                    placeholder="Ask Lovable to create a portfolio website for my..." 
                    className="w-full bg-transparent border-none outline-none text-foreground placeholder-muted-foreground"
                  />
                </div>
                <Button 
                  className="ml-2"
                  onClick={handleCreateProject}
                >
                  Project Blueprint
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-2 justify-center">
            {suggestions.map((suggestion, index) => (
              <div 
                key={index} 
                className="bg-accent/50 text-foreground px-4 py-2 rounded-full border border-border hover:bg-accent cursor-pointer transition-all"
              >
                {suggestion}
              </div>
            ))}
          </div>
        </div>

        <Card className="shadow-card-light dark:shadow-card-dark animate-fade">
          <CardContent className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-foreground">My Projects</h2>
              <Button 
                variant="ghost" 
                className="text-muted-foreground hover:text-foreground transition-colors"
                onClick={handleViewAll}
              >
                View All
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Create Project Card */}
              <div 
                className="rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-all cursor-pointer bg-card shadow-card-light dark:shadow-card-dark flex flex-col items-center justify-center h-[11rem]"
                onClick={handleCreateProject}
              >
                <Plus className="h-12 w-12 text-muted-foreground mb-2" />
                <h3 className="text-lg font-medium text-foreground">Create Project</h3>
              </div>
              
              {/* Existing Projects */}
              {projects.map((project) => (
                <div 
                  key={project.id}
                  className="rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-all cursor-pointer bg-card shadow-card-light dark:shadow-card-dark"
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HomePage;
