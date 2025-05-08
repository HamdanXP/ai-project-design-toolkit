
import React, { createContext, useState, useContext, ReactNode } from "react";
import { ProjectPhase } from "@/types/project";
import { UseCase, Dataset, FeasibilityConstraint, DataSuitabilityCheck } from "@/types/scoping-phase";

// Define the shape of our project context
interface ProjectContextType {
  // Phase tracking
  phases: ProjectPhase[];
  setPhases: React.Dispatch<React.SetStateAction<ProjectPhase[]>>;
  activePhaseId: string;
  setActivePhaseId: React.Dispatch<React.SetStateAction<string>>;
  
  // Project details
  projectPrompt: string;
  setProjectPrompt: React.Dispatch<React.SetStateAction<string>>;
  projectFiles: string[];
  setProjectFiles: React.Dispatch<React.SetStateAction<string[]>>;
  
  // Scoping phase data
  scopingActiveStep: number;
  setScopingActiveStep: React.Dispatch<React.SetStateAction<number>>;
  selectedUseCase: UseCase | null;
  setSelectedUseCase: React.Dispatch<React.SetStateAction<UseCase | null>>;
  constraints: FeasibilityConstraint[];
  setConstraints: React.Dispatch<React.SetStateAction<FeasibilityConstraint[]>>;
  selectedDataset: Dataset | null;
  setSelectedDataset: React.Dispatch<React.SetStateAction<Dataset | null>>;
  suitabilityChecks: DataSuitabilityCheck[];
  setSuitabilityChecks: React.Dispatch<React.SetStateAction<DataSuitabilityCheck[]>>;
  scopingFinalDecision: 'proceed' | 'revise' | null;
  setScopingFinalDecision: React.Dispatch<React.SetStateAction<'proceed' | 'revise' | null>>;
}

// Create the context with a default undefined value
const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// Provider component
export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Phase tracking state
  const [phases, setPhases] = useState<ProjectPhase[]>([
    {
      id: "reflection",
      name: "Reflection",
      status: "in-progress",
      progress: 0,
      totalSteps: 7,
      completedSteps: 0
    },
    {
      id: "scoping",
      name: "Scoping",
      status: "not-started",
      progress: 0,
      totalSteps: 5,
      completedSteps: 0
    },
    {
      id: "development",
      name: "Development",
      status: "not-started",
      progress: 0,
      totalSteps: 6,
      completedSteps: 0
    },
    {
      id: "evaluation",
      name: "Evaluation",
      status: "not-started",
      progress: 0,
      totalSteps: 4,
      completedSteps: 0
    }
  ]);
  const [activePhaseId, setActivePhaseId] = useState<string>("reflection");
  
  // Project details state
  const [projectPrompt, setProjectPrompt] = useState<string>("");
  const [projectFiles, setProjectFiles] = useState<string[]>([]);
  
  // Scoping phase state
  const [scopingActiveStep, setScopingActiveStep] = useState<number>(1);
  const [selectedUseCase, setSelectedUseCase] = useState<UseCase | null>(null);
  const [constraints, setConstraints] = useState<FeasibilityConstraint[]>([
    { id: "time", label: "Time Available", value: "medium-term", options: ["short-term", "medium-term", "long-term"], type: "select" },
    { id: "tech", label: "Technical Capacity", value: "moderate", options: ["limited", "moderate", "extensive"], type: "select" },
    { id: "compute", label: "Computing Resources", value: "cloud", options: ["local", "cloud", "hybrid"], type: "select" },
    { id: "internet", label: "Internet Access", value: true, type: "toggle" },
    { id: "infrastructure", label: "Local Infrastructure", value: true, type: "toggle" }
  ]);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [suitabilityChecks, setSuitabilityChecks] = useState<DataSuitabilityCheck[]>([
    { id: "clean", question: "Is the data clean and usable?", answer: "unknown", description: "" },
    { id: "representative", question: "Is it representative and fair?", answer: "unknown", description: "" },
    { id: "privacy", question: "Are there privacy/ethical concerns?", answer: "unknown", description: "" },
    { id: "quality", question: "Is the data quality sufficient?", answer: "unknown", description: "" }
  ]);
  const [scopingFinalDecision, setScopingFinalDecision] = useState<'proceed' | 'revise' | null>(null);

  return (
    <ProjectContext.Provider
      value={{
        phases, 
        setPhases,
        activePhaseId, 
        setActivePhaseId,
        projectPrompt, 
        setProjectPrompt,
        projectFiles, 
        setProjectFiles,
        scopingActiveStep, 
        setScopingActiveStep,
        selectedUseCase, 
        setSelectedUseCase,
        constraints, 
        setConstraints,
        selectedDataset, 
        setSelectedDataset,
        suitabilityChecks, 
        setSuitabilityChecks,
        scopingFinalDecision, 
        setScopingFinalDecision,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

// Custom hook to use the project context
export const useProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
