
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Shield, CheckCircle, Info } from "lucide-react";
import { RiskMitigation } from "@/types/scoping-phase";

type RiskMitigationPanelProps = {
  riskMitigations: RiskMitigation[];
  feasibilityRisk: 'low' | 'medium' | 'high';
};

export const RiskMitigationPanel = ({ riskMitigations, feasibilityRisk }: RiskMitigationPanelProps) => {
  const getRiskIcon = (impact: string) => {
    switch (impact) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'medium': return <Info className="h-4 w-4 text-yellow-600" />;
      default: return <Shield className="h-4 w-4 text-green-600" />;
    }
  };

  const getRiskColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'border-l-red-500 bg-red-50 dark:bg-red-950/20';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20';
      default: return 'border-l-green-500 bg-green-50 dark:bg-green-950/20';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Risk Mitigation Strategies
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {feasibilityRisk === 'high' && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-800 dark:text-red-200">High Risk Detected</h4>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    Your project faces significant challenges. Consider addressing critical constraints before proceeding or adjusting project scope.
                  </p>
                </div>
              </div>
            </div>
          )}

          {riskMitigations.map((mitigation, index) => (
            <Card key={index} className={`border-l-4 ${getRiskColor(mitigation.impact)}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {getRiskIcon(mitigation.impact)}
                  <div className="flex-1">
                    <h4 className="font-medium mb-2">{mitigation.risk}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{mitigation.mitigation}</p>
                    
                    {mitigation.examples.length > 0 && (
                      <div>
                        <p className="text-xs font-medium mb-2 text-primary">Practical Examples:</p>
                        <ul className="text-xs space-y-1">
                          {mitigation.examples.map((example, exIndex) => (
                            <li key={exIndex} className="flex items-start gap-1">
                              <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                              <span>{example}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
