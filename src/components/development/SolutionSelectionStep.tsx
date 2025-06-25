import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Shield, Users, Eye, AlertCircle, Loader2, RefreshCw, Play, Info } from "lucide-react";
import { AISolution, SolutionsData } from "@/types/development-phase";
import { formatTechnicalSpecs } from "@/lib/developmentApi";
import React from "react";

export interface SolutionSelectionStepProps {
  solutionsData: SolutionsData | null;
  solutionsLoading: boolean;
  solutionsError: string | null;
  selectedSolution: AISolution | null;
  onSelectSolution: (solution: AISolution) => void;
  getSolutionBadgeInfo: (solution: AISolution) => Array<{ text: string; variant: string }>;
  onBack: () => void;
  onNext: () => void;
  retrySolutions: () => void;
}

export const SolutionSelectionStep = ({
  solutionsData,
  solutionsLoading,
  solutionsError,
  selectedSolution,
  onSelectSolution,
  getSolutionBadgeInfo,
  onBack,
  onNext,
  retrySolutions,
}: SolutionSelectionStepProps) => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>Choose Your AI Solution</CardTitle>
        <CardDescription>
          Each solution is a complete, ready-to-deploy system with built-in ethical safeguards. Recommended solutions are specifically optimized for your project.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {solutionsLoading && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div className="text-center">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Generating AI Solutions</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Analyzing your project and creating tailored AI solutions...
              </p>
              <p className="text-gray-500 dark:text-gray-500 text-xs mt-2">
                This may take a moment while we generate 5 custom solutions for your project
              </p>
            </div>
          </div>
        )}
        {solutionsError && !solutionsLoading && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <div className="text-center">
              <h3 className="text-lg font-semibold text-destructive">Error Generating Solutions</h3>
              <p className="text-muted-foreground mt-2">{solutionsError}</p>
              <Button onClick={retrySolutions} className="mt-4 flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Retry Generating Solutions
              </Button>
            </div>
          </div>
        )}
        {solutionsData && !solutionsLoading && (
          <div className="space-y-6">
            <div className="space-y-4">
              {solutionsData.available_solutions
                .filter((solution) => solution.recommended)
                .map((solution) => {
                  const badges = getSolutionBadgeInfo(solution);
                  return (
                    <Card
                      key={solution.id}
                      className={`cursor-pointer transition-all hover:border-gray-300 dark:hover:border-gray-600 ${
                        selectedSolution?.id === solution.id
                          ? 'border-blue-500 border-2 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                          : 'border-green-200 dark:border-green-700 bg-green-50/50 dark:bg-green-900/10'
                      }`}
                      onClick={() => onSelectSolution(solution)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{solution.title}</h3>
                              {badges.map((badge, idx) => (
                                <Badge
                                  key={idx}
                                  className={
                                    badge.variant === 'success'
                                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700'
                                      : badge.variant === 'primary'
                                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700'
                                      : ''
                                  }
                                >
                                  {badge.text}
                                </Badge>
                              ))}
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{solution.description}</p>
                            <p className="text-xs text-green-600 dark:text-green-400 font-medium">{solution.best_for}</p>
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-sm mb-2 text-gray-900 dark:text-gray-100">What You'll Get:</h4>
                            <ul className="text-xs space-y-1">
                              {solution.capabilities.slice(0, 4).map((capability, idx) => (
                                <li key={idx} className="flex items-center gap-2">
                                  <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                                  <span className="text-gray-700 dark:text-gray-300">{capability}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-medium text-sm mb-2 text-gray-900 dark:text-gray-100">Technical Stack:</h4>
                            <div className="text-xs space-y-1 text-gray-600 dark:text-gray-400">
                              {formatTechnicalSpecs(solution).map((spec, idx) => (
                                <p key={idx}>
                                  <span className="font-medium">{spec.label}:</span> {spec.value}
                                </p>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
            {selectedSolution && (
              <Card className="border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/10">
                <CardHeader>
                  <CardTitle className="text-green-800 dark:text-green-200 flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Built-in Ethical Safeguards
                  </CardTitle>
                  <CardDescription className="text-green-700 dark:text-green-300">
                    Your {selectedSolution.title} automatically includes these ethical protections
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedSolution.ethical_safeguards.map((safeguard, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 flex items-center justify-center">
                          {safeguard.icon === 'users' && <Users className="h-4 w-4" />}
                          {safeguard.icon === 'eye' && <Eye className="h-4 w-4" />}
                          {safeguard.icon === 'shield' && <Shield className="h-4 w-4" />}
                        </div>
                        <h4 className="font-medium text-green-800 dark:text-green-200">{safeguard.category}</h4>
                      </div>
                      <div className="ml-6 space-y-1">
                        {safeguard.measures.map((measure, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            <span className="text-sm text-green-700 dark:text-green-300">{measure}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <Alert className="bg-green-100 dark:bg-green-900/20 border-green-300 dark:border-green-700">
                    <Info className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800 dark:text-green-200">
                      These safeguards are automatically implemented in your generated project based on humanitarian AI ethics guidelines.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </CardContent>
    </Card>
    <div className="flex justify-between">
      <Button variant="outline" onClick={onBack}>Back to Overview</Button>
      <Button onClick={onNext} disabled={!selectedSolution}>Generate Complete Project</Button>
    </div>
  </div>
);

