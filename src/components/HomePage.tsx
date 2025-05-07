
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Plus, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";

const HomePage = () => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");
  
  // Example of projects data - would come from an API in a real app
  const [projects] = useState([
    { id: 1, name: "Portfolio Website", image: "https://via.placeholder.com/300x200/3B82F6/FFFFFF?text=Portfolio" },
    { id: 2, name: "Recipe Finder App", image: "https://via.placeholder.com/300x200/10B981/FFFFFF?text=Recipes" },
    { id: 3, name: "Task Manager", image: "https://via.placeholder.com/300x200/3B82F6/FFFFFF?text=Tasks" },
    { id: 4, name: "Weather Dashboard", image: "https://via.placeholder.com/300x200/10B981/FFFFFF?text=Weather" },
  ]);

  const [suggestions] = useState([
    {
      title: "🌪 Disaster Response",
      prompt: "I want to implement AI for real-time disaster assessment and resource allocation."
    },
    {
      title: "🏥 Healthcare",
      prompt: "I want to implement AI for diagnostic assistance and predictive disease outbreak monitoring."
    },
    {
      title: "🌾 Food Security",
      prompt: "I want to implement AI for crop yield prediction and food distribution optimization."
    },
    {
      title: "📢 Crisis Communication",
      prompt: "I want to implement AI for automated misinformation detection and emergency alert dissemination."
    },
    {
      title: "🛂 Refugee Support",
      prompt: "I want to implement AI for streamlining refugee registration and personalised aid recommendations."
    },
    {
      title: "🔍 Humanitarian Logistics",
      prompt: "I want to implement AI for optimising supply chain management and delivery of aid in crisis zones."
    }
  ]);

  const handleCreateProject = () => {
    navigate("/project-blueprint");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleGoToBlueprint = () => {
    if (inputValue.trim()) {
      navigate("/project-blueprint");
    }
  };

  const handleSuggestionClick = (prompt: string) => {
    setInputValue(prompt);
  };

  const handleViewAll = () => {
    navigate("/my-projects");
  };

  return (
    <div className="pt-16 min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 md:py-12">
        <div className="max-w-3xl mx-auto text-center mb-8 md:mb-16 animate-fade">
          <h1 className="text-3xl md:text-5xl font-bold mb-3 md:mb-6 text-foreground">
            Build something <span className="text-primary">Lovable</span>
          </h1>
          <p className="text-base md:text-xl text-muted-foreground mb-6 md:mb-8">
            Idea to app in seconds, with your personal full stack engineer
          </p>

          <Card className="mb-4 md:mb-8 shadow-card-light dark:shadow-card-dark">
            <CardContent className="p-3 md:p-6">
              <div className="relative flex items-center">
                <Input
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder="Ask Lovable to create a portfolio website for my..."
                  className="pr-12 bg-transparent border-none outline-none text-foreground placeholder-muted-foreground text-sm md:text-base"
                />
                <Button
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 rounded-full aspect-square p-1.5"
                  size="icon"
                  disabled={!inputValue.trim()}
                  onClick={handleGoToBlueprint}
                >
                  <ArrowRight className={`size-4 ${!inputValue.trim() ? 'text-muted-foreground' : ''}`} />
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-2 justify-center">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion.prompt)}
                className="bg-accent/50 text-foreground px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-full border border-border hover:bg-accent cursor-pointer transition-all text-xs whitespace-normal text-left"
              >
                {suggestion.title}
              </button>
            ))}
          </div>
        </div>

        <Card className="shadow-card-light dark:shadow-card-dark animate-fade">
          <CardContent className="p-4 md:p-8">
            <div className="flex justify-between items-center mb-4 md:mb-6">
              <h2 className="text-lg md:text-2xl font-bold text-foreground">My Projects</h2>
              <Button 
                variant="ghost" 
                className="text-muted-foreground hover:text-foreground transition-colors text-sm md:text-base"
                onClick={handleViewAll}
              >
                View All
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
              {/* Create Project Card */}
              <div 
                className="rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-all cursor-pointer bg-card shadow-card-light dark:shadow-card-dark flex flex-col items-center justify-center h-[9rem] sm:h-[11rem]"
                onClick={handleCreateProject}
              >
                <Plus className="h-6 w-6 md:h-12 md:w-12 text-muted-foreground mb-2" />
                <h3 className="text-sm md:text-lg font-medium text-foreground">Create Project</h3>
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
                    className="w-full h-24 md:h-40 object-cover"
                  />
                  <div className="p-3 md:p-4">
                    <h3 className="text-sm md:text-lg font-medium text-foreground">{project.name}</h3>
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
