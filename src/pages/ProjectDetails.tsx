
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TopBar } from "@/components/TopBar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BackButton } from "@/components/BackButton";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { Footer } from "@/components/Footer";

// This would come from an API in a real app
const PROJECT_DATA = {
  "1": {
    id: "1",
    name: "Portfolio Website",
    description: "A responsive portfolio website for showcasing my work and skills",
    image: "https://via.placeholder.com/300x200/3B82F6/FFFFFF?text=Portfolio",
    createdAt: "2025-02-15T12:00:00Z",
    updatedAt: "2025-04-21T09:30:00Z",
    progress: 68,
    phases: [
      { name: "Reflection", progress: 100 },
      { name: "Scoping", progress: 75 },
      { name: "Development", progress: 50 },
      { name: "Evaluation", progress: 25 }
    ]
  },
  "2": {
    id: "2",
    name: "Recipe Finder App",
    description: "An AI-powered app that suggests recipes based on available ingredients",
    image: "https://via.placeholder.com/300x200/10B981/FFFFFF?text=Recipes",
    createdAt: "2025-03-10T14:20:00Z",
    updatedAt: "2025-05-01T16:45:00Z",
    progress: 45,
    phases: [
      { name: "Reflection", progress: 100 },
      { name: "Scoping", progress: 80 },
      { name: "Development", progress: 0 },
      { name: "Evaluation", progress: 0 }
    ]
  },
  "3": {
    id: "3",
    name: "Task Manager",
    description: "A smart task manager with AI prioritization and scheduling",
    image: "https://via.placeholder.com/300x200/3B82F6/FFFFFF?text=Tasks",
    createdAt: "2025-01-05T09:10:00Z",
    updatedAt: "2025-04-15T11:25:00Z",
    progress: 92,
    phases: [
      { name: "Reflection", progress: 100 },
      { name: "Scoping", progress: 100 },
      { name: "Development", progress: 95 },
      { name: "Evaluation", progress: 70 }
    ]
  }
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
};

const ProjectDetails = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const project = projectId ? PROJECT_DATA[projectId as keyof typeof PROJECT_DATA] : null;
  
  // Display loading or 404 state if no project
  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <TopBar />
        <div className="container mx-auto px-4 py-12 pt-24">
          <div className="flex items-center mb-8">
            <BackButton />
            <h1 className="text-3xl font-bold text-foreground ml-3">Project Not Found</h1>
          </div>
          <Card>
            <CardContent className="p-6 flex flex-col items-center justify-center min-h-[300px]">
              <p className="text-lg text-muted-foreground mb-4">
                We couldn't find the project you're looking for.
              </p>
              <Button onClick={() => navigate('/my-projects')}>
                Return to My Projects
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleContinueProject = () => {
    navigate('/project-blueprint');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar />
      <div className="container mx-auto px-4 py-12 pt-24 flex-grow">
        <div className="flex items-center mb-8">
          <BackButton />
          <h1 className="text-3xl font-bold text-foreground ml-3">{project.name}</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Project Overview */}
          <div className="lg:col-span-2">
            <Card className="shadow-card-light dark:shadow-card-dark mb-6">
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/3">
                    <img 
                      src={project.image} 
                      alt={project.name} 
                      className="w-full aspect-video object-cover rounded-md"
                    />
                  </div>
                  <div className="md:w-2/3">
                    <h2 className="text-xl md:text-2xl font-semibold mb-2">{project.name}</h2>
                    <p className="text-muted-foreground mb-4">{project.description}</p>
                    <div className="flex flex-wrap gap-4 mb-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>Created: {formatDate(project.createdAt)}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>Last Updated: {formatDate(project.updatedAt)}</span>
                      </div>
                    </div>
                    <div className="mb-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Overall Progress</span>
                        <span>{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>
                    <div className="mt-6">
                      <Button onClick={handleContinueProject} className="w-full md:w-auto">
                        Continue Project <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Project Description */}
            <Card className="shadow-card-light dark:shadow-card-dark">
              <CardContent className="p-4 md:p-6">
                <h3 className="text-lg font-medium mb-4">Project Details</h3>
                <p className="text-muted-foreground mb-4">
                  This project uses AI to address specific business needs and improve outcomes. 
                  The AI implementation follows responsible design principles to ensure ethical 
                  usage and provide real value to users.
                </p>
                
                <h4 className="font-medium mt-6 mb-2">Key Technologies</h4>
                <div className="flex flex-wrap gap-2">
                  {["Machine Learning", "Data Analysis", "Natural Language Processing", "Computer Vision"].map(tech => (
                    <div key={tech} className="bg-accent/50 text-foreground px-2.5 py-1.5 rounded-full border border-border text-xs">
                      {tech}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Progress Sidebar */}
          <div className="lg:col-span-1">
            <Card className="shadow-card-light dark:shadow-card-dark">
              <CardContent className="p-4 md:p-6">
                <h3 className="text-lg font-medium mb-4">Phase Progress</h3>
                
                <div className="space-y-5">
                  {project.phases.map((phase, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{phase.name} Phase</span>
                        <span>{phase.progress}%</span>
                      </div>
                      <Progress value={phase.progress} className="h-2" />
                    </div>
                  ))}
                </div>
                
                <div className="mt-8">
                  <Button 
                    variant="outline" 
                    onClick={handleContinueProject} 
                    className="w-full"
                  >
                    Resume Work
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProjectDetails;
