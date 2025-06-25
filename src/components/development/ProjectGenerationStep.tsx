import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Download, Play } from "lucide-react";
import type { AISolution, ProjectGenerationResponse } from "@/types/development-phase";

export interface ProjectGenerationStepProps {
  selectedSolution: AISolution;
  generatedProject: ProjectGenerationResponse | null;
  generationInProgress: boolean;
  generationProgress: number;
  onGenerateProject: () => void;
  onDownloadFile: (type: 'complete' | 'documentation' | 'setup' | 'ethical-report' | 'deployment') => void;
  onBack: () => void;
  onComplete: () => void;
}

export const ProjectGenerationStep = ({
  selectedSolution,
  generatedProject,
  generationInProgress,
  generationProgress,
  onGenerateProject,
  onDownloadFile,
  onBack,
  onComplete,
}: ProjectGenerationStepProps) => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>Generate Your AI Project</CardTitle>
        <CardDescription>
          Creating your complete {selectedSolution.title} with all ethical safeguards
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!generatedProject ? (
          <div className="text-center py-8">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Ready to Generate:</h3>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <p>✅ {selectedSolution.title}</p>
                <p>✅ Complete source code (frontend + backend)</p>
                <p>✅ Ethical safeguards automatically integrated</p>
                <p>✅ Documentation and deployment guide</p>
                <p>✅ Sample data and test cases</p>
                <p>✅ Configuration for your deployment environment</p>
              </div>
              {generationInProgress ? (
                <div className="space-y-4">
                  <div className="animate-spin mx-auto h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Generating your AI project...</p>
                  <div className="w-64 mx-auto space-y-2">
                    <Progress value={generationProgress} className="h-2" />
                    <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                      {generationProgress < 95
                        ? `Creating project structure and code... ${Math.round(generationProgress)}%`
                        : 'Finalizing project files... 95%'}
                    </p>
                  </div>
                </div>
              ) : (
                <Button onClick={onGenerateProject} className="mx-auto flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  Generate Complete Project
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 space-y-6">
            <div className="text-6xl">🎉</div>
            <div>
              <h3 className="text-xl font-semibold text-green-600 mb-2">Project Generated Successfully!</h3>
              <p className="text-gray-600 dark:text-gray-400">Your complete AI solution is ready with all ethical safeguards built-in</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Button onClick={() => onDownloadFile('complete')} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Complete Project
              </Button>
              <Button variant="outline" onClick={() => onDownloadFile('documentation')}>Documentation</Button>
              <Button variant="outline" onClick={() => onDownloadFile('setup')}>Setup Guide</Button>
              <Button variant="outline" onClick={() => onDownloadFile('ethical-report')}>Ethics Report</Button>
              <Button variant="outline" onClick={() => onDownloadFile('deployment')}>Deployment</Button>
            </div>
            <Separator />
            <Alert>
              <AlertDescription>
                <strong>What's Included:</strong> Complete source code, deployment scripts, documentation, ethical audit reports, and step-by-step setup instructions. Ready to deploy to your environment.
              </AlertDescription>
            </Alert>
            {generatedProject.next_steps && generatedProject.next_steps.length > 0 && (
              <div className="text-left">
                <h4 className="font-medium mb-2">Next Steps:</h4>
                <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                  {generatedProject.next_steps.map((step, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="font-medium text-primary">{index + 1}.</span>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
    <div className="flex justify-between">
      <Button variant="outline" onClick={onBack}>Back to Choose Solution</Button>
      {generatedProject && (
        <Button size="lg" onClick={onComplete}>Continue to Evaluation Phase</Button>
      )}
    </div>
  </div>
);

