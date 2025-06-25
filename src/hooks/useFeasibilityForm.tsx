import { useState } from "react";
import { useProject } from "@/contexts/ProjectContext";
import {
  FeasibilityConstraint,
  FeasibilityCategory,
  RiskMitigation,
} from "@/types/scoping-phase";

export const useFeasibilityForm = (
  constraints: FeasibilityConstraint[],
  handleConstraintUpdate: (id: string, value: string | boolean) => void,
) => {
  const { reflectionAnswers } = useProject();

  const [constraintValues, setConstraintValues] = useState<Record<string, string | boolean>>(() => {
    const initial: Record<string, string | boolean> = {};
    constraints.forEach((c) => {
      initial[c.id] = c.value;
    });
    return initial;
  });

  const feasibilityCategories: FeasibilityCategory[] = [
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
          helpText: getContextualHelpText("budget", reflectionAnswers),
          examples: ["Under $1K", "$1K-$10K", "$10K-$50K", "Over $50K"],
          feasibilityLevel: "high" // Changed from riskLevel
        },
        {
          id: "time",
          label: "Project Timeline",
          value: constraintValues["time"] || "medium-term",
          options: ["short-term", "medium-term", "long-term", "ongoing"],
          type: "select",
          importance: "critical",
          helpText: getContextualHelpText("time", reflectionAnswers),
          examples: ["1-3 months", "3-6 months", "6-12 months", "Over 1 year"],
          feasibilityLevel: "medium" // Changed from riskLevel
        }
      ]
    }
  ];

          }
      ]
    }
  ];

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
          feasibilityLevel: "medium" // Changed from riskLevel
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
          helpText: getContextualHelpText("compute", reflectionAnswers),
          examples: ["Personal laptop", "Cloud services (AWS, Google)", "Mix of both", "Dedicated servers"],
          feasibilityLevel: "high" // Changed from riskLevel
        },
        {
          id: "internet",
          label: "Reliable Internet Connection",
          value: constraintValues["internet"] ?? true,
          type: "toggle",
          importance: "important",
          helpText: "Consistent, high-speed internet is essential for AI development",
          examples: ["Stable broadband", "Mobile hotspot backup", "Multiple ISP options"],
          feasibilityLevel: "medium" // Changed from riskLevel
        },
        {
          id: "infrastructure",
          label: "Local Technology Setup",
          value: constraintValues["infrastructure"] ?? true,
          type: "toggle",
          importance: "important",
          helpText: "Access to necessary hardware, software, and workspace",
          examples: ["Modern computers", "Software licenses", "Quiet workspace"],
          feasibilityLevel: "low" // Changed from riskLevel
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
          helpText: getContextualHelpText("ai-experience", reflectionAnswers),
          examples: ["No experience", "Some online courses", "Previous projects", "Expert level"],
          feasibilityLevel: "high" // Changed from riskLevel
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
          feasibilityLevel: "medium" // Changed from riskLevel
        },
        {
          id: "learning-capacity",
          label: "Learning & Training Capacity",
          value: constraintValues["learning-capacity"] ?? true,
          type: "toggle",
          importance: "important",
          helpText: "Team's ability and willingness to learn new skills during the project",
          examples: ["Dedicated learning time", "Training budget", "Mentorship available"],
          feasibilityLevel: "low" // Changed from riskLevel
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
          helpText: getContextualHelpText("stakeholder-support", reflectionAnswers),
          examples: ["Some skepticism", "General support", "Strong backing", "Executive champion"],
          feasibilityLevel: "high" // Changed from riskLevel
        },
        {
          id: "change-management",
          label: "Change Management Readiness",
          value: constraintValues["change-management"] ?? false,
          type: "toggle",
          importance: "important",
          helpText: "Organization's ability to adapt to new AI-powered processes",
          examples: ["Change management plan", "Training programs", "Communication strategy"],
          feasibilityLevel: "medium" // Changed from riskLevel
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
          feasibilityLevel: "medium" // Changed from riskLevel
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
          feasibilityLevel: "high" // Changed from riskLevel
        },
        {
          id: "partnerships",
          label: "External Partnerships",
          value: constraintValues["partnerships"] ?? false,
          type: "toggle",
          importance: "moderate",
          helpText: "Access to external expertise, technology providers, or research institutions",
          examples: ["University collaborations", "Tech vendor partnerships", "Consultant relationships"],
          feasibilityLevel: "low" // Changed from riskLevel
        },
        {
          id: "sustainability",
          label: "Long-term Sustainability Plan",
          value: constraintValues["sustainability"] ?? false,
          type: "toggle",
          importance: "important",
          helpText: "Strategy for maintaining and evolving the AI solution over time",
          examples: ["Maintenance budget", "Skill development plan", "Technology roadmap"],
          feasibilityLevel: "medium" // Changed from riskLevel
        }
      ]
    }
  ];

  // Simple risk mitigation strategies based on constraints
  const getRiskMitigations = (): RiskMitigation[] => {
    const mitigations: RiskMitigation[] = [];
    
    if (constraintValues["ai-experience"] === "none" || constraintValues["ai-experience"] === "beginner") {
      mitigations.push({
        risk: "Limited Technical Expertise",
        impact: "high",
        mitigation: "Consider partnerships, training programs, or hiring consultants to bridge skill gaps",
        examples: [
          "Partner with a local university's AI program",
          "Hire part-time AI consultants for guidance",
          "Invest in team training before project starts",
          "Use no-code/low-code AI platforms initially"
        ]
      });
    }
    
    if (constraintValues["budget"] === "limited") {
      mitigations.push({
        risk: "Insufficient Budget",
        impact: "high",
        mitigation: "Start with a smaller pilot project or seek additional funding sources",
        examples: [
          "Apply for technology grants for nonprofits",
          "Use free cloud credits from major providers",
          "Focus on pre-trained models to reduce costs",
          "Partner with organizations for resource sharing"
        ]
      });
    }
    
    if (constraintValues["stakeholder-support"] === "low") {
      mitigations.push({
        risk: "Stakeholder Resistance",
        impact: "medium",
        mitigation: "Develop a comprehensive change management and communication strategy",
        examples: [
          "Create clear communication about AI benefits",
          "Involve stakeholders in design process",
          "Start with pilot programs to demonstrate value",
          "Provide training and support during transition"
        ]
      });
    }
    
    if (constraintValues["internet"] === false || constraintValues["compute"] === "local") {
      mitigations.push({
        risk: "Technical Infrastructure Gaps",
        impact: "medium",
        mitigation: "Leverage cloud services and establish reliable connectivity solutions",
        examples: [
          "Start with cloud-based development environment",
          "Implement offline-capable solutions for poor connectivity",
          "Use managed AI services to reduce infrastructure needs",
          "Plan for hybrid cloud-local deployment"
        ]
      });
    }

    return mitigations;
  };

  const handleCategoryConstraintUpdate = (categoryId: string, constraintId: string, value: string | boolean) => {
    // Update local state
    setConstraintValues(prev => ({
      ...prev,
      [constraintId]: value
    }));
    
    // Update parent component
    handleConstraintUpdate(constraintId, value);
  };

  return {
    constraintValues,
    feasibilityCategories,
    getRiskMitigations,
    handleCategoryConstraintUpdate,
  };
};

// Helper functions for contextual help text
function getContextualHelpText(constraintId: string, reflectionAnswers: Record<string, string>): string {
  const baseHelpTexts: Record<string, string> = {
    "budget": "Consider all costs: computing, data, tools, training, and maintenance",
    "time": "How much time do you realistically have for development and deployment?",
    "compute": "What computing power do you have access to for training and running AI models?",
    "ai-experience": "Your team's collective experience with AI and machine learning",
    "stakeholder-support": "Level of support from leadership, beneficiaries, and key stakeholders"
  };

  const baseText = baseHelpTexts[constraintId] || "";
  const contextualAdvice = getContextualAdvice(constraintId, reflectionAnswers);
  
  return contextualAdvice ? `${baseText} ${contextualAdvice}` : baseText;
}

function getContextualAdvice(constraintId: string, reflectionAnswers: Record<string, string>): string {
  const answers = Object.values(reflectionAnswers).join(' ').toLowerCase();
  
  const contextualAdvice: Record<string, Record<string, string>> = {
    'budget': {
      'emergency_response': 'Emergency projects often have access to rapid funding but tight timelines.',
      'data_analysis': 'Data projects may need budget for premium tools and cloud storage.',
      'community_engagement': 'Community projects should budget for stakeholder workshops and feedback sessions.',
      'predictive_modeling': 'ML projects need budget for compute resources and potentially labeled data.',
    },
    'ai-experience': {
      'computer_vision': 'Image processing projects require specialized CV knowledge or mentorship.',
      'nlp_chatbot': 'Text processing benefits from NLP expertise and language model experience.',
      'predictive_modeling': 'Statistical modeling and ML evaluation skills are critical.',
    },
    'stakeholder-support': {
      'community_centered': 'Community projects absolutely require strong local stakeholder buy-in.',
      'organizational_tool': 'Internal tools need management support and user adoption planning.',
      'research_study': 'Research projects need academic/institutional backing for credibility.',
    }
  };

  // Simple keyword matching to determine context
  let projectContext = 'default';
  if (answers.includes('emergency') || answers.includes('crisis')) {
    projectContext = 'emergency_response';
  } else if (answers.includes('community') || answers.includes('beneficiar')) {
    projectContext = 'community_centered';
  } else if (answers.includes('data analysis') || answers.includes('analyze')) {
    projectContext = 'data_analysis';
  } else if (answers.includes('predict') || answers.includes('forecast')) {
    projectContext = 'predictive_modeling';
  } else if (answers.includes('image') || answers.includes('visual')) {
    projectContext = 'computer_vision';
  } else if (answers.includes('text') || answers.includes('language')) {
    projectContext = 'nlp_chatbot';
  } else if (answers.includes('internal') || answers.includes('staff')) {
    projectContext = 'organizational_tool';
  }

  return contextualAdvice[constraintId]?.[projectContext] || '';
}\nexport type UseFeasibilityFormReturn = ReturnType<typeof useFeasibilityForm>;

