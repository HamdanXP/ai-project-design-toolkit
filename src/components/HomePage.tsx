import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Image,
  Paperclip,
  File,
  X,
  Layers,
  Loader2,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Footer } from "@/components/Footer";
import { useToast } from "@/hooks/useToast";
import { usePageTitle } from "@/hooks/usePageTitle";
import { api, ProjectSuggestion } from "@/lib/api";
import { projectStorage, StoredProject } from "@/lib/project-storage";

const DEFAULT_SUGGESTIONS: ProjectSuggestion[] = [
  {
    title: "🌪 Disaster Response",
    prompt:
      "We need AI to help assess earthquake damage and coordinate relief efforts across affected regions.",
  },
  {
    title: "🏥 Healthcare",
    prompt:
      "Our medical team needs AI to help diagnose malaria cases and predict disease outbreaks in rural communities.",
  },
  {
    title: "🌾 Food Security",
    prompt:
      "We want AI to help predict crop yields and optimise food distribution to prevent hunger in vulnerable areas.",
  },
  {
    title: "📢 Crisis Communication",
    prompt:
      "Our organisation needs AI to detect misinformation during emergencies and send accurate alerts to communities.",
  },
  {
    title: "🛂 Refugee Support",
    prompt:
      "We need AI to streamline refugee registration processes and recommend personalised assistance programs.",
  },
  {
    title: "🔍 Humanitarian Logistics",
    prompt:
      "Our team wants AI to optimise supply chain management and improve the delivery of aid materials to crisis zones.",
  },
];

const HomePage = () => {
  usePageTitle("Home");

  const navigate = useNavigate();
  const { toast } = useToast();
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [recentProjects, setRecentProjects] = useState<StoredProject[]>([]);
  const [suggestions] = useState<ProjectSuggestion[]>(DEFAULT_SUGGESTIONS);
  const [isFocused, setIsFocused] = useState(false);

  const MIN_INPUT_LENGTH = 30;
  const isInputValid = inputValue.trim().length >= MIN_INPUT_LENGTH;

  useEffect(() => {
    const projects = projectStorage.getFirst(4);
    setRecentProjects(projects);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);

    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleGoToBlueprint = async () => {
    if (!isInputValid) {
      toast({
        title: "Input Required",
        description: `Please provide at least ${MIN_INPUT_LENGTH} characters describing your humanitarian challenge.`,
        variant: "destructive",
      });
      return;
    }

    if (inputValue.trim()) {
      setIsLoading(true);

      try {
        const backendResponse = await api.backend.projects.create(
          inputValue.trim()
        );

        if (backendResponse.success) {
          const savedProject = projectStorage.add({
            id: backendResponse.data.id,
            title: backendResponse.data.title,
            description: backendResponse.data.description,
            createdAt: backendResponse.data.created_at,
          });

          setRecentProjects([savedProject, ...recentProjects.slice(0, 3)]);

          toast({
            title: "Project Created",
            description: "Your new project has been created successfully.",
          });

          navigate(`/project-blueprint?projectId=${backendResponse.data.id}`);
          return;
        }
      } catch (error) {
        console.log("Backend API not available, falling back to legacy method");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSuggestionClick = (prompt: string) => {
    setInputValue(prompt);

    setTimeout(() => {
      const textarea = document.getElementById(
        "prompt-input"
      ) as HTMLTextAreaElement;
      if (textarea) {
        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    }, 0);
  };

  const handleViewAll = () => {
    navigate("/my-projects");
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/project-blueprint?projectId=${projectId}`);
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
            An AI-powered assistant that helps humanitarians design AI solutions
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
                    e.target.style.height = "auto";
                    e.target.style.height = `${e.target.scrollHeight}px`;
                  }}
                />
                <div className="flex items-center justify-between mt-2">
                  <div className="flex gap-1">
                    <div className="text-xs text-muted-foreground">
                      {inputValue.trim().length}/{MIN_INPUT_LENGTH} characters minimum
                    </div>
                  </div>
                  <Button
                    className="rounded-full aspect-square p-1.5"
                    size="icon"
                    disabled={!inputValue.trim() || isLoading}
                    onClick={handleGoToBlueprint}
                  >
                    {isLoading ? (
                      <Loader2 className="size-4 animate-spin text-muted-foreground" />
                    ) : (
                      <ArrowRight
                        className={`size-4 ${
                          !inputValue.trim() ? "text-muted-foreground" : ""
                        }`}
                      />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-2 justify-center mb-6 md:mb-8">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion.prompt)}
                className="bg-accent/50 text-foreground px-3 py-2 rounded-full border border-border hover:bg-accent cursor-pointer transition-all text-xs sm:text-sm whitespace-normal text-center max-w-[180px] sm:max-w-none"
              >
                {suggestion.title}
              </button>
            ))}
          </div>
        </div>

        {recentProjects.length > 0 && (
          <Card className="shadow-card-light dark:shadow-card-dark animate-fade">
            <CardContent className="p-4 md:p-8">
              <div className="flex justify-between items-center mb-4 md:mb-6">
                <h2 className="text-lg md:text-2xl font-bold text-foreground">
                  My Projects
                </h2>
                <Button
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground transition-colors text-sm md:text-base"
                  onClick={handleViewAll}
                >
                  View All
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                {recentProjects.map((project) => (
                  <div
                    key={project.id}
                    className="group rounded-lg border border-border hover:border-primary/50 transition-all cursor-pointer bg-card shadow-card-light dark:shadow-card-dark hover:shadow-lg"
                    onClick={() => handleProjectClick(project.id)}
                  >
                    <div className="p-4 md:p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-primary to-primary/60 flex-shrink-0 mt-1"></div>
                        <time className="text-xs text-muted-foreground font-medium">
                          {new Date(project.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </time>
                      </div>

                      <h3 className="text-base md:text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {project.title}
                      </h3>

                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {project.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span className="text-xs font-medium text-muted-foreground">
                            Ready to continue
                          </span>
                        </div>

                        <div className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default HomePage;
