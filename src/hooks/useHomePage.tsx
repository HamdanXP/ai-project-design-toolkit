import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/useToast";
import { api, Project, ProjectSuggestion } from "@/lib/api";

const DEFAULT_SUGGESTIONS: ProjectSuggestion[] = [
  { title: "\ud83c\udf2a Disaster Response", prompt: "I want to implement AI for real-time disaster assessment and resource allocation." },
  { title: "\ud83c\udf4f Healthcare", prompt: "I want to implement AI for diagnostic assistance and predictive disease outbreak monitoring." },
  { title: "\ud83c\udf3e Food Security", prompt: "I want to implement AI for crop yield prediction and food distribution optimization." },
  { title: "\ud83d\udce3 Crisis Communication", prompt: "I want to implement AI for automated misinformation detection and emergency alert dissemination." },
  { title: "\ud83d\uddec Refugee Support", prompt: "I want to implement AI for streamlining refugee registration and personalised aid recommendations." },
  { title: "\ud83d\udd0d Humanitarian Logistics", prompt: "I want to implement AI for optimising supply chain management and delivery of aid in crisis zones." }
];

export const useHomePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [inputValue, setInputValue] = useState("");
  const [isAttachingFile, setIsAttachingFile] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [suggestions] = useState<ProjectSuggestion[]>(DEFAULT_SUGGESTIONS);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const projects = await api.projects.getAll();
        setRecentProjects(projects.slice(0, 4));
      } catch (error) {
        setRecentProjects([
          { id: "1", name: "Healthcare AI Project", description: "AI solution for healthcare applications", image: "https://via.placeholder.com/300x200/3B82F6/FFFFFF?text=Healthcare", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), progress: 25, tags: ["Healthcare", "AI"], phases: [] },
          { id: "2", name: "Education AI Solution", description: "AI-powered educational tools", image: "https://via.placeholder.com/300x200/10B981/FFFFFF?text=Education", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), progress: 40, tags: ["Education", "AI"], phases: [] },
          { id: "3", name: "Financial Services AI", description: "AI for financial analysis and prediction", image: "https://via.placeholder.com/300x200/3B82F6/FFFFFF?text=Finance", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), progress: 60, tags: ["Finance", "AI"], phases: [] },
          { id: "4", name: "Environmental AI Project", description: "AI solutions for environmental monitoring", image: "https://via.placeholder.com/300x200/10B981/FFFFFF?text=Environment", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), progress: 80, tags: ["Environment", "AI"], phases: [] }
        ]);
      }
    };

    loadProjects();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleGoToBlueprint = async () => {
    if (!inputValue.trim()) return;
    setIsLoading(true);
    try {
      const backendResponse = await api.backend.projects.create(inputValue.trim());
      if (backendResponse.success) {
        toast({ title: "Project Created", description: "Your new project has been created successfully." });
        navigate(`/project-blueprint?projectId=${backendResponse.data.id}`);
        return;
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (prompt: string) => {
    setInputValue(prompt);
    setTimeout(() => {
      const textarea = document.getElementById("prompt-input") as HTMLTextAreaElement;
      if (textarea) {
        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    }, 0);
  };

  const handleViewAll = () => navigate("/my-projects");
  const handleProjectClick = (projectId: string) => navigate(`/project/${projectId}`);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
      setIsAttachingFile(false);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return {
    inputValue,
    setInputValue,
    isAttachingFile,
    setIsAttachingFile,
    selectedFiles,
    isLoading,
    recentProjects,
    suggestions,
    handleInputChange,
    handleGoToBlueprint,
    handleSuggestionClick,
    handleViewAll,
    handleProjectClick,
    handleFileChange,
    handleRemoveFile
  };
};

export type UseHomePageReturn = ReturnType<typeof useHomePage>;
