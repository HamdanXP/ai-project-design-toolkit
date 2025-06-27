import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Flag, 
  Lightbulb, 
  Target,
  Brain,
  Cpu,
  Users,
  Settings,
  Download
} from "lucide-react";
import { ProjectReadinessAssessment } from "@/types/reflection-phase";
import { useProject } from "@/contexts/ProjectContext";

interface ProjectReadinessModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  assessment: ProjectReadinessAssessment | null;
  onProceed: () => void;
  onRevise: () => void;
  isAdvancing: boolean;
  getQuestionTitle: (key: string) => string;
}

export const ProjectReadinessModal: React.FC<ProjectReadinessModalProps> = ({
  isOpen,
  onOpenChange,
  assessment,
  onProceed,
  onRevise,
  isAdvancing,
  getQuestionTitle
}) => {
  const { reflectionAnswers } = useProject();
  const [isDownloading, setIsDownloading] = useState(false);
  
  if (!assessment) return null;

  // Generate and download PDF report using browser print
  const downloadPDF = async () => {
    setIsDownloading(true);
    
    try {
      // Create a new window with the report content
      const printWindow = window.open('', '_blank');
      
      if (!printWindow) {
        throw new Error('Failed to open print window - popup blocker may be active');
      }
      
      // Generate the HTML content for the PDF
      const htmlContent = generateReportHTML();
      
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Wait a moment for content to load, then trigger print
      setTimeout(() => {
        printWindow.print();
        // Close the window after printing (user can cancel if needed)
        setTimeout(() => {
          if (!printWindow.closed) {
            printWindow.close();
          }
        }, 1000);
      }, 500);
      
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      // Fallback: download as text file
      downloadAsText();
    } finally {
      setIsDownloading(false);
    }
  };
  
  const generateReportHTML = () => {
    const timestamp = new Date().toLocaleString();
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Project Readiness Assessment Report</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          margin: 20px;
          color: #333;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #ccc;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #2563eb;
          margin-bottom: 10px;
        }
        .section {
          margin-bottom: 30px;
          page-break-inside: avoid;
        }
        .section h2 {
          color: #1f2937;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 5px;
        }
        .score-box {
          background: #f3f4f6;
          padding: 15px;
          border-radius: 8px;
          margin: 10px 0;
        }
        .score-high { border-left: 4px solid #10b981; }
        .score-medium { border-left: 4px solid #f59e0b; }
        .score-low { border-left: 4px solid #ef4444; }
        .question-answer {
          margin-bottom: 20px;
          page-break-inside: avoid;
        }
        .question {
          font-weight: bold;
          color: #374151;
          margin-bottom: 5px;
        }
        .answer {
          margin-left: 20px;
          padding: 10px;
          background: #f9fafb;
          border-radius: 4px;
        }
        .flag {
          background: #fef3c7;
          border: 1px solid #f59e0b;
          padding: 10px;
          border-radius: 4px;
          margin: 10px 0;
        }
        .recommendations {
          background: #eff6ff;
          border: 1px solid #3b82f6;
          padding: 15px;
          border-radius: 8px;
        }
        .recommendations ul {
          margin: 10px 0;
          padding-left: 20px;
        }
        .alternatives {
          background: #f0fdf4;
          border: 1px solid #22c55e;
          padding: 15px;
          border-radius: 8px;
          margin: 15px 0;
        }
        @media print {
          body { 
            margin: 15px; 
            background: white !important;
            color: black !important;
          }
          .section { page-break-inside: avoid; }
          .question-answer { page-break-inside: avoid; }
          /* Ensure all text is readable when printed */
          * {
            color: black !important;
            background: white !important;
          }
          .score-high { 
            border-left: 4px solid #10b981 !important; 
            background: #f0fdf4 !important;
          }
          .score-medium { 
            border-left: 4px solid #f59e0b !important; 
            background: #fffbeb !important;
          }
          .score-low { 
            border-left: 4px solid #ef4444 !important; 
            background: #fef2f2 !important;
          }
          .flag {
            background: #fef3c7 !important;
            border: 1px solid #f59e0b !important;
          }
          .recommendations {
            background: #eff6ff !important;
            border: 1px solid #3b82f6 !important;
          }
          .alternatives {
            background: #f0fdf4 !important;
            border: 1px solid #22c55e !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Project Readiness Assessment Report</h1>
        <p>Generated: ${timestamp}</p>
      </div>
      
      <div class="section">
        <h2>Overall Assessment</h2>
        <div class="score-box ${getScoreClass(assessment.overall_readiness_score)}">
          <strong>Overall Readiness Score: ${Math.round(assessment.overall_readiness_score * 100)}%</strong><br>
          <strong>Recommendation: ${assessment.proceed_recommendation ? 'READY TO PROCEED' : 'REVIEW RECOMMENDED'}</strong>
        </div>
        <p>${assessment.summary}</p>
      </div>
      
      <div class="section">
        <h2>Detailed Scores</h2>
        <div class="score-box ${getScoreClass(assessment.ethical_score)}">
          <strong>Ethical Readiness: ${Math.round(assessment.ethical_score * 100)}%</strong><br>
          ${assessment.ethical_summary}
        </div>
        <div class="score-box ${getScoreClass(assessment.ai_appropriateness_score)}">
          <strong>AI Appropriateness: ${Math.round(assessment.ai_appropriateness_score * 100)}%</strong><br>
          <strong>AI Recommendation:</strong> ${assessment.ai_recommendation.replace('_', ' ').toUpperCase()}<br>
          ${assessment.ai_appropriateness_summary}
        </div>
      </div>
      
      ${assessment.alternative_solutions && (
        assessment.alternative_solutions.digital_alternatives.length > 0 ||
        assessment.alternative_solutions.process_improvements.length > 0 ||
        assessment.alternative_solutions.non_digital_solutions.length > 0
      ) ? `
      <div class="section">
        <h2>Recommended Alternatives</h2>
        <div class="alternatives">
          ${assessment.alternative_solutions.digital_alternatives.length > 0 ? `
            <h3>Digital Solutions:</h3>
            <ul>
              ${assessment.alternative_solutions.digital_alternatives.map(alt => `<li>${alt}</li>`).join('')}
            </ul>
          ` : ''}
          ${assessment.alternative_solutions.process_improvements.length > 0 ? `
            <h3>Process Improvements:</h3>
            <ul>
              ${assessment.alternative_solutions.process_improvements.map(alt => `<li>${alt}</li>`).join('')}
            </ul>
          ` : ''}
          ${assessment.alternative_solutions.non_digital_solutions.length > 0 ? `
            <h3>Non-Digital Solutions:</h3>
            <ul>
              ${assessment.alternative_solutions.non_digital_solutions.map(alt => `<li>${alt}</li>`).join('')}
            </ul>
          ` : ''}
          ${assessment.alternative_solutions.reasoning ? `
            <p><strong>Reasoning:</strong> ${assessment.alternative_solutions.reasoning}</p>
          ` : ''}
        </div>
      </div>
      ` : ''}
      
      ${assessment.question_flags.length > 0 ? `
      <div class="section">
        <h2>Areas Needing Attention</h2>
        ${assessment.question_flags.map((flag, index) => `
          <div class="flag">
            <strong>${index + 1}. ${getQuestionTitle(flag.question_key)}</strong> 
            (${flag.severity.toUpperCase()} - ${flag.category.toUpperCase()})<br>
            ${flag.issue}
          </div>
        `).join('')}
      </div>
      ` : ''}
      
      <div class="section">
        <h2>Actionable Recommendations</h2>
        <div class="recommendations">
          <ul>
            ${assessment.actionable_recommendations.map(rec => `<li>${rec}</li>`).join('')}
          </ul>
        </div>
      </div>
      
      <div class="section">
        <h2>Reflection Questions & Answers</h2>
        ${Object.entries(reflectionAnswers).map(([key, answer], index) => {
          if (answer && answer.trim()) {
            const isImportant = assessment.question_flags.some(f => f.question_key === key);
            return `
              <div class="question-answer">
                <div class="question">Q${index + 1}: ${getQuestionTitle(key)}${isImportant ? ' ⚠️' : ''}</div>
                <div class="answer">${answer.replace(/\n/g, '<br>')}</div>
              </div>
            `;
          }
          return '';
        }).join('')}
      </div>
      
    </body>
    </html>
    `;
  };
  
  const getScoreClass = (score: number) => {
    if (score >= 0.7) return 'score-high';
    if (score >= 0.5) return 'score-medium';
    return 'score-low';
  };
  
  const downloadAsText = () => {
    // Fallback: download as text file
    const content = generateTextReport();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `project-readiness-assessment-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const generateTextReport = () => {
    const timestamp = new Date().toLocaleString();
    
    let content = `PROJECT READINESS ASSESSMENT REPORT\n`;
    content += `Generated: ${timestamp}\n`;
    content += `${'='.repeat(50)}\n\n`;
    
    content += `OVERALL ASSESSMENT\n`;
    content += `-`.repeat(20) + '\n';
    content += `Overall Readiness Score: ${Math.round(assessment.overall_readiness_score * 100)}%\n`;
    content += `Recommendation: ${assessment.proceed_recommendation ? 'READY TO PROCEED' : 'REVIEW RECOMMENDED'}\n`;
    content += `${assessment.summary}\n\n`;
    
    content += `DETAILED SCORES\n`;
    content += `-`.repeat(15) + '\n';
    content += `Ethical Readiness: ${Math.round(assessment.ethical_score * 100)}%\n`;
    content += `${assessment.ethical_summary}\n\n`;
    content += `AI Appropriateness: ${Math.round(assessment.ai_appropriateness_score * 100)}%\n`;
    content += `AI Recommendation: ${assessment.ai_recommendation.replace('_', ' ').toUpperCase()}\n`;
    content += `${assessment.ai_appropriateness_summary}\n\n`;
    
    if (assessment.actionable_recommendations.length > 0) {
      content += `ACTIONABLE RECOMMENDATIONS\n`;
      content += `-`.repeat(25) + '\n';
      assessment.actionable_recommendations.forEach((rec, index) => {
        content += `${index + 1}. ${rec}\n`;
      });
      content += '\n';
    }
    
    content += `REFLECTION QUESTIONS & ANSWERS\n`;
    content += `-`.repeat(30) + '\n';
    Object.entries(reflectionAnswers).forEach(([key, answer], index) => {
      if (answer && answer.trim()) {
        const isImportant = assessment.question_flags.some(f => f.question_key === key);
        content += `Q${index + 1}: ${getQuestionTitle(key)}${isImportant ? ' ⚠️' : ''}\n`;
        content += `${answer}\n\n`;
      }
    });
    
    return content;
  };

  // Helper to get severity color
  const getSeverityColor = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  // Helper to get AI recommendation color and icon with dark mode support
  const getAIRecommendationStyle = (recommendation: string) => {
    switch (recommendation) {
      case 'highly_appropriate':
        return { 
          color: 'text-green-700 dark:text-green-300', 
          bg: 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800', 
          icon: CheckCircle 
        };
      case 'appropriate':
        return { 
          color: 'text-blue-700 dark:text-blue-300', 
          bg: 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800', 
          icon: CheckCircle 
        };
      case 'questionable':
        return { 
          color: 'text-amber-700 dark:text-amber-300', 
          bg: 'bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800', 
          icon: AlertTriangle 
        };
      case 'not_appropriate':
        return { 
          color: 'text-red-700 dark:text-red-300', 
          bg: 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800', 
          icon: XCircle 
        };
      default:
        return { 
          color: 'text-gray-700 dark:text-gray-300', 
          bg: 'bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800', 
          icon: AlertTriangle 
        };
    }
  };

  const aiStyle = getAIRecommendationStyle(assessment.ai_recommendation);
  const AIIcon = aiStyle.icon;

  // Separate ethical and appropriateness flags
  const ethicalFlags = assessment.question_flags.filter(flag => flag.category === 'ethical');
  const appropriatenessFlags = assessment.question_flags.filter(flag => flag.category === 'appropriateness');

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
        <AlertDialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {assessment.proceed_recommendation ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              )}
              <AlertDialogTitle>Project Readiness Assessment Results</AlertDialogTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadPDF}
              disabled={isDownloading}
              className="flex items-center gap-2"
            >
              <Download className={`h-4 w-4 ${isDownloading ? 'animate-pulse' : ''}`} />
              {isDownloading ? 'Generating...' : 'Print/Save PDF'}
            </Button>
          </div>
          <AlertDialogDescription>
            Review the analysis of your project's ethical readiness and AI appropriateness before proceeding.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-6">
          {/* Overall Readiness Score */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-lg text-foreground">Overall Project Readiness</h4>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-foreground">{Math.round(assessment.overall_readiness_score * 100)}%</span>
                {assessment.threshold_met ? (
                  <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500 dark:text-red-400" />
                )}
              </div>
            </div>
            <Progress value={assessment.overall_readiness_score * 100} className="h-3" />
            <p className="text-sm bg-muted/50 p-4 rounded-lg text-foreground">{assessment.summary}</p>
          </div>

          {/* Two-column layout for assessments */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* AI Appropriateness Assessment */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <h4 className="font-semibold text-foreground">AI Appropriateness Analysis</h4>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">AI Suitability Score</span>
                  <span className="text-lg font-bold text-foreground">{Math.round(assessment.ai_appropriateness_score * 100)}%</span>
                </div>
                <Progress value={assessment.ai_appropriateness_score * 100} className="h-2" />
                
                <div className={`p-3 rounded-lg border ${aiStyle.bg}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <AIIcon className={`h-4 w-4 ${aiStyle.color}`} />
                    <span className={`text-sm font-medium ${aiStyle.color}`}>
                      AI Recommendation: {assessment.ai_recommendation.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <p className={`text-xs ${aiStyle.color}`}>
                    {assessment.ai_appropriateness_summary}
                  </p>
                </div>

                {/* Alternative Solutions (if AI not appropriate) */}
                {assessment.alternative_solutions && (
                  <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-3 rounded-lg">
                    <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Settings className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-blue-700 dark:text-blue-300">Recommended Alternatives</span>
                    </h5>
                    <div className="space-y-2 text-xs">
                      {assessment.alternative_solutions.digital_alternatives.length > 0 && (
                        <div>
                          <span className="font-medium text-blue-800 dark:text-blue-200">Digital Solutions:</span>
                          <ul className="ml-2 mt-1">
                            {assessment.alternative_solutions.digital_alternatives.map((alt, i) => (
                              <li key={i} className="text-blue-700 dark:text-blue-300">• {alt}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {assessment.alternative_solutions.process_improvements.length > 0 && (
                        <div>
                          <span className="font-medium text-blue-800 dark:text-blue-200">Process Improvements:</span>
                          <ul className="ml-2 mt-1">
                            {assessment.alternative_solutions.process_improvements.map((alt, i) => (
                              <li key={i} className="text-blue-700 dark:text-blue-300">• {alt}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <p className="text-blue-600 dark:text-blue-400 italic mt-2">{assessment.alternative_solutions.reasoning}</p>
                    </div>
                  </div>
                )}

                {/* Appropriateness Flags */}
                {appropriatenessFlags.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium mb-2 flex items-center gap-2 text-foreground">
                      <Cpu className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      Technical Concerns
                    </h5>
                    <div className="space-y-2">
                      {appropriatenessFlags.map((flag, index) => (
                        <div key={index} className="border border-border rounded-lg p-2 bg-card">
                          <div className="flex items-start justify-between mb-1">
                            <p className="font-medium text-xs text-foreground">{getQuestionTitle(flag.question_key)}</p>
                            <Badge variant={getSeverityColor(flag.severity)} className="text-xs">
                              {flag.severity}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{flag.issue}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Ethical Assessment */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                <h4 className="font-semibold text-foreground">Ethical Considerations</h4>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Ethical Readiness Score</span>
                  <span className="text-lg font-bold text-foreground">{Math.round(assessment.ethical_score * 100)}%</span>
                </div>
                <Progress value={assessment.ethical_score * 100} className="h-2" />
                
                <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 p-3 rounded-lg">
                  <p className="text-xs text-green-700 dark:text-green-300">{assessment.ethical_summary}</p>
                </div>

                {/* Ethical Question Flags */}
                {ethicalFlags.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium mb-2 flex items-center gap-2 text-foreground">
                      <Flag className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      Ethical Concerns
                    </h5>
                    <div className="space-y-2">
                      {ethicalFlags.map((flag, index) => (
                        <div key={index} className="border border-border rounded-lg p-2 bg-card">
                          <div className="flex items-start justify-between mb-1">
                            <p className="font-medium text-xs text-foreground">{getQuestionTitle(flag.question_key)}</p>
                            <Badge variant={getSeverityColor(flag.severity)} className="text-xs">
                              {flag.severity}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{flag.issue}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actionable Recommendations */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <Lightbulb className="h-4 w-4" />
              Next Steps & Recommendations
            </h4>
            <ul className="space-y-2">
              {assessment.actionable_recommendations.map((rec, index) => (
                <li key={index} className="text-sm flex items-start gap-2">
                  <Target className="h-4 w-4 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Overall Recommendation */}
          <div className={`p-4 rounded-lg border-2 ${
            assessment.proceed_recommendation 
              ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' 
              : 'bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800'
          }`}>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              {assessment.proceed_recommendation ? (
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              )}
              <span className={assessment.proceed_recommendation 
                ? "text-green-800 dark:text-green-200" 
                : "text-amber-800 dark:text-amber-200"
              }>
                Overall Recommendation: {assessment.proceed_recommendation ? 'Ready to Proceed' : 'Review Recommended'}
              </span>
            </h4>
            <p className={`text-sm ${
              assessment.proceed_recommendation 
                ? 'text-green-700 dark:text-green-300' 
                : 'text-amber-700 dark:text-amber-300'
            }`}>
              {assessment.proceed_recommendation 
                ? 'Your project demonstrates strong readiness across both ethical and technical dimensions.'
                : 'Consider addressing the concerns above to strengthen your project foundation before proceeding.'
              }
            </p>
          </div>
        </div>

        <AlertDialogFooter className="flex gap-2">
          <AlertDialogCancel onClick={onRevise} disabled={isAdvancing}>
            Revise Answers
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onProceed}
            disabled={isAdvancing}
            className="bg-green-600 hover:bg-green-700"
          >
            {isAdvancing ? 'Proceeding...' : 'Proceed to Scoping'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};