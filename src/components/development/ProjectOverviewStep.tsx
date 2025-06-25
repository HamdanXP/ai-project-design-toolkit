import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Lightbulb } from "lucide-react";
import type { ReturnType } from "react";
import { extractContextSummary } from "@/lib/developmentApi";

export interface ProjectOverviewStepProps {
  summary: ReturnType<typeof extractContextSummary>;
  onNext: () => void;
}

export const ProjectOverviewStep = ({ summary, onNext }: ProjectOverviewStepProps) => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          Your Project Context
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-medium mb-2 text-gray-900 dark:text-gray-100">
            {summary.projectTitle}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            We've analyzed your project and will generate AI solutions specifically designed for {summary.targetBeneficiaries}
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Project Domain</h4>
            <p className="text-blue-800 dark:text-blue-200 text-sm font-medium capitalize">
              {summary.domain.replace('_', ' ')}
            </p>
            <p className="text-blue-700 dark:text-blue-300 text-xs mt-1">
              {summary.hasUseCase ? 'Use case selected' : 'General approach'} •
              {summary.hasDeploymentEnv ? ' Deployment configured' : ' Standard deployment'}
            </p>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">AI Solutions Ready</h4>
            <div className="space-y-1 text-xs">
              <p className="text-green-800 dark:text-green-200">✓ Context analyzed and ready</p>
              <p className="text-green-800 dark:text-green-200">✓ Ethical safeguards built-in</p>
              <p className="text-green-800 dark:text-green-200">✓ Complete code generation ready</p>
              <p className="text-green-800 dark:text-green-200">✓ Solutions will be generated on-demand</p>
            </div>
          </div>
        </div>
        {summary.keyRecommendations.length > 0 ? (
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              Strategic Recommendations for Your Project
            </h4>
            {summary.keyRecommendations.map((rec, index) => (
              <Alert key={index}>
                <AlertDescription>
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-gray-100">{rec.title}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{rec.description}</p>
                      </div>
                      <Badge variant="outline" className="ml-2">
                        {rec.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-500 italic">{rec.reason}</p>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            <Lightbulb className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Strategic recommendations will appear here based on your project analysis.</p>
          </div>
        )}
      </CardContent>
    </Card>
    <div className="flex justify-end">
      <Button onClick={onNext}>Choose Your AI Solution</Button>
    </div>
  </div>
);

