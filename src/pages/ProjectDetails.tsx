
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TopBar } from "@/components/TopBar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BackButton } from "@/components/BackButton";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, ArrowRight, Edit2, Check, X, Tag } from "lucide-react";
import { Footer } from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";

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
    tags: ["Machine Learning", "Data Analysis", "Natural Language Processing", "Computer Vision"],
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
    tags: ["Machine Learning", "Natural Language Processing", "Computer Vision"],
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
    tags: ["Machine Learning", "Data Analysis", "Natural Language Processing"],
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
  const { toast } = useToast();
  const [project, setProject] = useState(projectId ? PROJECT_DATA[projectId as keyof typeof PROJECT_DATA] : null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProject, setEditedProject] = useState(project);
  const [newTag, setNewTag] = useState("");
  
  // Update editedProject when project changes
  useEffect(() => {
    setEditedProject(project);
  }, [project]);

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

  const handleSave = () => {
    // In a real app, this would save to an API
    setProject(editedProject);
    setIsEditing(false);
    toast({
      title: "Changes saved",
      description: "Your project details have been updated successfully.",
    });
  };

  const handleCancel = () => {
    setEditedProject(project);
    setIsEditing(false);
  };

  const handleTagAdd = () => {
    if (newTag.trim() && !editedProject?.tags.includes(newTag.trim())) {
      setEditedProject({
        ...editedProject,
        tags: [...editedProject.tags, newTag.trim()]
      });
      setNewTag("");
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    setEditedProject({
      ...editedProject,
      tags: editedProject.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleRevisePhase = (phaseName: string) => {
    // For demo purposes, simply navigate to the project blueprint
    navigate('/project-blueprint');
    toast({
      title: "Phase selected",
      description: `You are now revising the ${phaseName} phase.`,
    });
  };
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar />
      <div className="container mx-auto px-4 py-12 pt-24 flex-grow">
        <div className="flex items-center mb-8">
          <BackButton />
          {!isEditing ? (
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-foreground ml-3">{project.name}</h1>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsEditing(true)}
                className="ml-2"
              >
                <Edit2 className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <div className="flex gap-2 items-center ml-3">
              <Button variant="default" onClick={handleSave}>
                <Check className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
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
                    {isEditing ? (
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-1 block">Project Name</label>
                          <Input 
                            value={editedProject?.name} 
                            onChange={(e) => setEditedProject({...editedProject, name: e.target.value})}
                            placeholder="Project name"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">Description</label>
                          <Textarea 
                            value={editedProject?.description} 
                            onChange={(e) => setEditedProject({...editedProject, description: e.target.value})}
                            placeholder="Project description"
                            rows={3}
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <h2 className="text-xl md:text-2xl font-semibold mb-2">{project.name}</h2>
                        <p className="text-muted-foreground mb-4">{project.description}</p>
                      </>
                    )}
                    
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
            
            {/* Project Tags */}
            <Card className="shadow-card-light dark:shadow-card-dark mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Tags</CardTitle>
                <CardDescription>Project categories and technologies</CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {editedProject?.tags.map(tag => (
                        <div key={tag} className="bg-accent/50 text-foreground px-2.5 py-1.5 rounded-full border border-border text-xs flex items-center gap-1">
                          {tag}
                          <button 
                            onClick={() => handleTagRemove(tag)} 
                            className="ml-1 text-muted-foreground hover:text-foreground"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a tag..."
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleTagAdd();
                            e.preventDefault();
                          }
                        }}
                        className="flex-1"
                      />
                      <Button onClick={handleTagAdd} size="sm">
                        <Tag size={16} className="mr-1" /> Add
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map(tech => (
                      <div key={tech} className="bg-accent/50 text-foreground px-2.5 py-1.5 rounded-full border border-border text-xs">
                        {tech}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Project Description */}
            <Card className="shadow-card-light dark:shadow-card-dark">
              <CardHeader>
                <CardTitle className="text-lg">Project Details</CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                {isEditing ? (
                  <Textarea 
                    value={editedProject?.description} 
                    onChange={(e) => setEditedProject({...editedProject, description: e.target.value})}
                    placeholder="Project description"
                    rows={5}
                    className="mb-4"
                  />
                ) : (
                  <p className="text-muted-foreground mb-4">
                    {project.description}<br/><br/>
                    This project uses AI to address specific business needs and improve outcomes. 
                    The AI implementation follows responsible design principles to ensure ethical 
                    usage and provide real value to users.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Progress Sidebar */}
          <div className="lg:col-span-1">
            <Card className="shadow-card-light dark:shadow-card-dark mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Phase Progress</CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="space-y-5">
                  {project.phases.map((phase, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{phase.name} Phase</span>
                        <span>{phase.progress}%</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Progress value={phase.progress} className="h-2 flex-grow" />
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleRevisePhase(phase.name)}
                          disabled={phase.progress === 0}
                          className="whitespace-nowrap text-xs px-2 h-8"
                        >
                          {phase.progress === 100 ? "Revise" : "Continue"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-card-light dark:shadow-card-dark">
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="space-y-3">
                  <Button 
                    onClick={handleContinueProject} 
                    className="w-full justify-start"
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Continue Project
                  </Button>
                  
                  {!isEditing ? (
                    <Button 
                      variant="outline" 
                      onClick={() => setIsEditing(true)}
                      className="w-full justify-start"
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit Project Details
                    </Button>
                  ) : null}
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
