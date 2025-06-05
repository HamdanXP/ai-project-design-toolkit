import { useState } from "react";
import { FeasibilityConstraint, FeasibilityCategory, RiskMitigation } from "@/types/scoping-phase";
import { FeasibilityWizard } from "./enhanced/FeasibilityWizard";

type FeasibilityFormProps = {
  constraints: FeasibilityConstraint[];
  handleConstraintUpdate: (id: string, value: string | boolean) => void;
  feasibilityScore: number;
  feasibilityRisk: 'low' | 'medium' | 'high';
  moveToPreviousStep: () => void;
  moveToNextStep: () => void;
};

export const FeasibilityForm = ({
  constraints,
  handleConstraintUpdate,
  feasibilityScore,
  feasibilityRisk,
  moveToPreviousStep,
  moveToNextStep,
}: FeasibilityFormProps) => {
  
  // Initialize state with constraint values
  const [constraintValues, setConstraintValues] = useState<Record<string, string | boolean>>(() => {
    const initialValues: Record<string, string | boolean> = {};
    constraints.forEach(constraint => {
      initialValues[constraint.id] = constraint.value;
    });
    return initialValues;
  });

  // Enhanced constraint categories with comprehensive assessment
  const feasibilityCategories: FeasibilityCategory[] = [
    {
      id: "resources",
      title: "Resources & Budget",
      description: "Assess your available resources and funding for the AI project",
      icon: "Resources",
      constraints: [
        {
          id: "budget",
          label: "Project Budget",
          value: constraintValues["budget"] || "limited",
          options: ["limited", "moderate", "substantial", "unlimited"],
          type: "select",
          importance: "critical",
          helpText: "Consider all costs: computing, data, tools, training, and maintenance",
          examples: ["Under $1K", "$1K-$10K", "$10K-$50K", "Over $50K"],
          riskLevel: "high"
        },
        {
          id: "time",
          label: "Project Timeline",
          value: constraintValues["time"] || "medium-term",
          options: ["short-term", "medium-term", "long-term", "ongoing"],
          type: "select",
          importance: "critical",
          helpText: "How much time do you realistically have for development and deployment?",
          examples: ["1-3 months", "3-6 months", "6-12 months", "Over 1 year"],
          riskLevel: "medium"
        },
        {
          id: "team-size",
          label: "Team Size",
          value: constraintValues["team-size"] || "small",
          options: ["individual", "small", "medium", "large"],
          type: "select",
          importance: "important",
          helpText: "Number of people who can actively contribute to the project",
          examples: ["Just me", "2-3 people", "4-8 people", "9+ people"],
          riskLevel: "medium"
        }
      ]
    },
    {
      id: "technical",
      title: "Technical Infrastructure",
      description: "Evaluate your technical capabilities and infrastructure",
      icon: "Technical",
      constraints: [
        {
          id: "compute",
          label: "Computing Resources",
          value: constraintValues["compute"] || "cloud",
          options: ["local", "cloud", "hybrid", "enterprise"],
          type: "select",
          importance: "critical",
          helpText: "What computing power do you have access to for training and running AI models?",
          examples: ["Personal laptop", "Cloud services (AWS, Google)", "Mix of both", "Dedicated servers"],
          riskLevel: "high"
        },
        {
          id: "internet",
          label: "Reliable Internet Connection",
          value: constraintValues["internet"] ?? true,
          type: "toggle",
          importance: "important",
          helpText: "Consistent, high-speed internet is essential for AI development",
          examples: ["Stable broadband", "Mobile hotspot backup", "Multiple ISP options"],
          riskLevel: "medium"
        },
        {
          id: "infrastructure",
          label: "Local Technology Setup",
          value: constraintValues["infrastructure"] ?? true,
          type: "toggle",
          importance: "important",
          helpText: "Access to necessary hardware, software, and workspace",
          examples: ["Modern computers", "Software licenses", "Quiet workspace"],
          riskLevel: "low"
        }
      ]
    },
    {
      id: "expertise",
      title: "Team Expertise",
      description: "Assess your team's skills and experience with AI projects",
      icon: "Expertise",
      constraints: [
        {
          id: "ai-experience",
          label: "AI/ML Experience",
          value: constraintValues["ai-experience"] || "beginner",
          options: ["none", "beginner", "intermediate", "advanced"],
          type: "select",
          importance: "critical",
          helpText: "Your team's collective experience with AI and machine learning",
          examples: ["No experience", "Some online courses", "Previous projects", "Expert level"],
          riskLevel: "high"
        },
        {
          id: "technical-skills",
          label: "Technical Skills",
          value: constraintValues["technical-skills"] || "moderate",
          options: ["limited", "moderate", "good", "excellent"],
          type: "select",
          importance: "important",
          helpText: "Programming, data analysis, and system administration skills",
          examples: ["Basic computer use", "Some programming", "Strong tech skills", "Professional developers"],
          riskLevel: "medium"
        },
        {
          id: "learning-capacity",
          label: "Learning & Training Capacity",
          value: constraintValues["learning-capacity"] ?? true,
          type: "toggle",
          importance: "important",
          helpText: "Team's ability and willingness to learn new skills during the project",
          examples: ["Dedicated learning time", "Training budget", "Mentorship available"],
          riskLevel: "low"
        }
      ]
    },
    {
      id: "organizational",
      title: "Organizational Readiness",
      description: "Evaluate organizational support and readiness for AI implementation",
      icon: "Organization",
      constraints: [
        {
          id: "stakeholder-support",
          label: "Stakeholder Buy-in",
          value: constraintValues["stakeholder-support"] || "moderate",
          options: ["low", "moderate", "high", "champion"],
          type: "select",
          importance: "critical",
          helpText: "Level of support from leadership, beneficiaries, and key stakeholders",
          examples: ["Some skepticism", "General support", "Strong backing", "Executive champion"],
          riskLevel: "high"
        },
        {
          id: "change-management",
          label: "Change Management Readiness",
          value: constraintValues["change-management"] ?? false,
          type: "toggle",
          importance: "important",
          helpText: "Organization's ability to adapt to new AI-powered processes",
          examples: ["Change management plan", "Training programs", "Communication strategy"],
          riskLevel: "medium"
        },
        {
          id: "data-governance",
          label: "Data Governance",
          value: constraintValues["data-governance"] || "developing",
          options: ["none", "developing", "established", "mature"],
          type: "select",
          importance: "important",
          helpText: "Policies and practices for data management, privacy, and security",
          examples: ["No formal policies", "Basic guidelines", "Clear procedures", "Comprehensive framework"],
          riskLevel: "medium"
        }
      ]
    },
    {
      id: "external",
      title: "External Factors",
      description: "Consider external constraints and requirements",
      icon: "External",
      constraints: [
        {
          id: "regulatory-compliance",
          label: "Regulatory Requirements",
          value: constraintValues["regulatory-compliance"] || "moderate",
          options: ["minimal", "moderate", "strict", "complex"],
          type: "select",
          importance: "critical",
          helpText: "Legal and regulatory constraints that may impact your AI project",
          examples: ["Basic privacy laws", "Sector regulations", "International compliance", "Multiple jurisdictions"],
          riskLevel: "high"
        },
        {
          id: "partnerships",
          label: "External Partnerships",
          value: constraintValues["partnerships"] ?? false,
          type: "toggle",
          importance: "moderate",
          helpText: "Access to external expertise, technology providers, or research institutions",
          examples: ["University collaborations", "Tech vendor partnerships", "Consultant relationships"],
          riskLevel: "low"
        },
        {
          id: "sustainability",
          label: "Long-term Sustainability Plan",
          value: constraintValues["sustainability"] ?? false,
          type: "toggle",
          importance: "important",
          helpText: "Strategy for maintaining and evolving the AI solution over time",
          examples: ["Maintenance budget", "Skill development plan", "Technology roadmap"],
          riskLevel: "medium"
        }
      ]
    }
  ];

  // Risk mitigation strategies based on common challenges
  const riskMitigations: RiskMitigation[] = [
    {
      risk: "Limited Technical Expertise",
      impact: "high",
      mitigation: "Consider partnerships, training programs, or hiring consultants to bridge skill gaps",
      examples: [
        "Partner with a local university's AI program",
        "Hire part-time AI consultants for guidance",
        "Invest in team training before project starts",
        "Use no-code/low-code AI platforms initially"
      ]
    },
    {
      risk: "Insufficient Budget",
      impact: "high",
      mitigation: "Start with a smaller pilot project or seek additional funding sources",
      examples: [
        "Apply for technology grants for nonprofits",
        "Use free cloud credits from major providers",
        "Focus on pre-trained models to reduce costs",
        "Partner with organizations for resource sharing"
      ]
    },
    {
      risk: "Data Quality Issues",
      impact: "medium",
      mitigation: "Invest time in data cleaning and validation before model development",
      examples: [
        "Conduct thorough data audit first",
        "Implement data quality monitoring",
        "Train staff on proper data collection",
        "Use data validation tools and techniques"
      ]
    },
    {
      risk: "Stakeholder Resistance",
      impact: "medium",
      mitigation: "Develop a comprehensive change management and communication strategy",
      examples: [
        "Create clear communication about AI benefits",
        "Involve stakeholders in design process",
        "Start with pilot programs to demonstrate value",
        "Provide training and support during transition"
      ]
    }
  ];

  const handleCategoryConstraintUpdate = (categoryId: string, constraintId: string, value: string | boolean) => {
    // Update local state
    setConstraintValues(prev => ({
      ...prev,
      [constraintId]: value
    }));
    
    // Update parent component
    handleConstraintUpdate(constraintId, value);
  };

  return (
    <FeasibilityWizard
      categories={feasibilityCategories}
      onUpdateConstraint={handleCategoryConstraintUpdate}
      feasibilityScore={feasibilityScore}
      feasibilityRisk={feasibilityRisk}
      riskMitigations={riskMitigations}
      moveToPreviousStep={moveToPreviousStep}
      moveToNextStep={moveToNextStep}
    />
  );
};
