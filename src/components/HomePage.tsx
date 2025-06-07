import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Image, Paperclip, File, X, Layers } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Footer } from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { api, Project, ProjectSuggestion } from "@/lib/api";

const HomePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [inputValue, setInputValue] = useState("");
  const [isAttachingFile, setIsAttachingFile] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  
  // Initialize with default suggestions that won't disappear
  const [suggestions, setSuggestions] = useState<ProjectSuggestion[]>([
    { title: "🌪 Disaster Response", prompt: "I want to implement AI for real-time disaster assessment and resource allocation." },
    { title: "🏥 Healthcare", prompt: "I want to implement AI for diagnostic assistance and predictive disease outbreak monitoring." },
    { title: "🌾 Food Security", prompt: "I want to implement AI for crop yield prediction and food distribution optimization." },
    { title: "📢 Crisis Communication", prompt: "I want to implement AI for automated misinformation detection and emergency alert dissemination." },
    { title: "🛂 Refugee Support", prompt: "I want to implement AI for streamlining refugee registration and personalised aid recommendations." },
    { title: "🔍 Humanitarian Logistics", prompt: "I want to implement AI for optimising supply chain management and delivery of aid in crisis zones." }
  ]);
  
  // Fetch recent projects and suggestions on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch recent projects
        const projects = await api.projects.getAll();
        setRecentProjects(projects.slice(0, 4)); // Only show the 4 most recent projects
      } catch (error) {
        // If API fails, use fallback data
        setRecentProjects([
          { id: "1", name: "Healthcare AI Project", description: "AI solution for healthcare applications", image: "https://via.placeholder.com/300x200/3B82F6/FFFFFF?text=Healthcare", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), progress: 25, tags: ["Healthcare", "AI"], phases: [] },
          { id: "2", name: "Education AI Solution", description: "AI-powered educational tools", image: "https://via.placeholder.com/300x200/10B981/FFFFFF?text=Education", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), progress: 40, tags: ["Education", "AI"], phases: [] },
          { id: "3", name: "Financial Services AI", description: "AI for financial analysis and prediction", image: "https://via.placeholder.com/300x200/3B82F6/FFFFFF?text=Finance", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), progress: 60, tags: ["Finance", "AI"], phases: [] },
          { id: "4", name: "Environmental AI Project", description: "AI solutions for environmental monitoring", image: "https://via.placeholder.com/300x200/10B981/FFFFFF?text=Environment", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), progress: 80, tags: ["Environment", "AI"], phases: [] },
        ]);
      }
      
      // Try to fetch project suggestions from API, but preserve defaults if it fails
      try {
        const fetchedSuggestions = await api.projects.getSuggestions();
        setSuggestions(fetchedSuggestions);
      } catch (error) {
        // Keep the default suggestions - they're already set in state initialization
        console.log('Using default suggestions');
      }
    };
    
    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    
    // Automatically adjust the height
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleGoToBlueprint = async () => {
    if (inputValue.trim()) {
      setIsLoading(true);
      
      try {
        // Try to create project using the backend API first
        const backendResponse = await api.backend.projects.create(inputValue.trim());
        
        if (backendResponse.success) {
          toast({
            title: "Project Created",
            description: "Your new project has been created successfully."
          });
          
          // Navigate to the project blueprint with the new project ID
          navigate(`/project-blueprint?projectId=${backendResponse.data.id}`);
          return;
        }
      } catch (error) {
        console.log('Backend API not available, falling back to legacy method');
      }
      
      try {
        // Fallback to legacy API if backend is not available
        const newProject = await api.projects.create({
          name: inputValue.split('.')[0].substring(0, 50), // Use the first sentence as the project name
          description: inputValue,
          prompt: inputValue,
          files: selectedFiles.map(file => file.name),
          progress: 0,
          tags: [],
          phases: [
            { id: "reflection", name: "Reflection", status: "not-started", progress: 0, totalSteps: 5, completedSteps: 0 },
            { id: "scoping", name: "Scoping", status: "not-started", progress: 0, totalSteps: 5, completedSteps: 0 },
            { id: "development", name: "Development", status: "not-started", progress: 0, totalSteps: 5, completedSteps: 0 },
            { id: "evaluation", name: "Evaluation", status: "not-started", progress: 0, totalSteps: 5, completedSteps: 0 }
          ]
        });
        
        toast({
          title: "Project Created",
          description: "Your new project has been created successfully."
        });
        
        // Navigate to the project blueprint with the new project ID
        navigate(`/project-blueprint?projectId=${newProject.id}`);
      } catch (error) {
        // Final fallback to localStorage
        localStorage.setItem('projectPrompt', inputValue);
        localStorage.setItem('projectFiles', JSON.stringify(selectedFiles.map(file => file.name)));
        
        toast({
          title: "Project Created",
          description: "Your new project has been created successfully."
        });
        
        navigate("/project-blueprint");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSuggestionClick = (prompt: string) => {
    setInputValue(prompt);
    
    // Update textarea height after setting the value
    setTimeout(() => {
      const textarea = document.getElementById('prompt-input') as HTMLTextAreaElement;
      if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    }, 0);
  };

  const handleViewAll = () => {
    navigate("/my-projects");
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/project/${projectId}`);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Convert FileList to array and append to existing files
      const newFiles = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
      setIsAttachingFile(false);
    }
  };
  
  const handleRemoveFile = (indexToRemove: number) => {
    setSelectedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="pt-16 min-h-screen bg-background flex flex-col">
      <div className="container mx-auto px-4 py-6 md:py-12 flex-grow">
        <div className="max-w-3xl mx-auto text-center mb-8 md:mb-16 animate-fade">
          <div className="flex justify-center mb-6">
            <div className="text-primary-foreground bg-primary rounded-full w-16 h-16 flex items-center justify-center">
              <Layers className="h-8 w-8" />
            </div>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold mb-3 md:mb-6 text-foreground">
            AI Project Design <span className="text-primary">Toolkit</span>
          </h1>
          <p className="text-base md:text-xl text-muted-foreground mb-6 md:mb-8">
            An AI-powered assistant that helps professionals design AI solutions
          </p>

          <Card className="mb-4 md:mb-8 shadow-card-light dark:shadow-card-dark">
            <CardContent className="p-3 md:p-6">
              <div className="relative flex flex-col">
                <Textarea
                  id="prompt-input"
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder="Ask APDT to design an AI solution for..."
                  className="bg-transparent border-none outline-none text-foreground placeholder-muted-foreground text-sm md:text-base min-h-[40px] resize-none overflow-hidden"
                  onFocus={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = `${e.target.scrollHeight}px`;
                  }}
                />
                
                {selectedFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 mb-1">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 bg-accent/20 p-2 rounded-md">
                        <File className="h-4 w-4 text-primary" />
                        <span className="text-xs text-foreground truncate max-w-[150px]">{file.name}</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0 ml-auto" 
                          onClick={() => handleRemoveFile(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center justify-between mt-2">
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={() => setIsAttachingFile(!isAttachingFile)}
                    >
                      <Paperclip className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    
                    {isAttachingFile && (
                      <div className="absolute bottom-12 left-0 bg-card p-3 rounded-md shadow-md border border-border flex gap-2">
                        <label className="cursor-pointer flex flex-col items-center gap-1">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Image className="h-5 w-5 text-primary" />
                          </div>
                          <span className="text-xs">Images</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleFileChange}
                            multiple
                          />
                        </label>
                        
                        <label className="cursor-pointer flex flex-col items-center gap-1">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <File className="h-5 w-5 text-primary" />
                          </div>
                          <span className="text-xs">Files</span>
                          <input 
                            type="file" 
                            className="hidden" 
                            onChange={handleFileChange}
                            multiple
                          />
                        </label>
                      </div>
                    )}
                  </div>
                  <Button
                    className="rounded-full aspect-square p-1.5"
                    size="icon"
                    disabled={!inputValue.trim() || isLoading}
                    onClick={handleGoToBlueprint}
                  >
                    <ArrowRight className={`size-4 ${!inputValue.trim() ? 'text-muted-foreground' : ''}`} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Suggestion buttons - always render if we have suggestions */}
          {suggestions && suggestions.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center mb-8">
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
          )}
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
              {/* Existing Projects */}
              {recentProjects.map((project) => (
                <div 
                  key={project.id}
                  className="rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-all cursor-pointer bg-card shadow-card-light dark:shadow-card-dark"
                  onClick={() => handleProjectClick(project.id)}
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
      <Footer />
    </div>
  );
};

export default HomePage;
