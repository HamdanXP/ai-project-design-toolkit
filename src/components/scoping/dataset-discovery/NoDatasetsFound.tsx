import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, Info, RefreshCw } from "lucide-react";

interface NoDatasetsFoundProps {
  onRetry?: () => void;
  isRetrying?: boolean;
}

export const NoDatasetsFound = ({ 
  onRetry,
  isRetrying = false
}: NoDatasetsFoundProps) => {
  
  // Show loading state during retry (same as NoUseCasesFound)
  if (isRetrying) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3 text-muted-foreground">Searching humanitarian data sources...</span>
      </div>
    );
  }
  
  return (
    <Card className="border-dashed border-2">
      <CardContent className="pt-6">
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-4">
            <Database className="h-8 w-8 text-orange-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Datasets Found from Humanitarian Sources</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            We searched ReliefWeb, UN databases, and HDX but couldn't find datasets matching your project requirements. This is common for specialized AI projects.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 max-w-lg mx-auto">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-900 mb-2">Next steps for your AI project:</h4>
                <ul className="text-sm text-blue-800 text-left space-y-1">
                  <li>• Contact humanitarian organizations directly for data partnerships</li>
                  <li>• Use publicly available datasets from government sources</li>
                  <li>• Consider synthetic or simulated data for initial development</li>
                  <li>• Plan your own data collection strategy</li>
                  <li>• Explore academic datasets in your domain</li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Retry button - same pattern as NoUseCasesFound */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-center">
            {onRetry && (
              <Button 
                variant="outline" 
                onClick={onRetry}
                disabled={isRetrying}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
                {isRetrying ? 'Searching...' : 'Search Again'}
              </Button>
            )}
          </div>
          
          <div className="text-xs text-muted-foreground pt-4 border-t mt-6">
            <p>Searched: ReliefWeb • UN Data • Humanitarian Data Exchange • WHO • WFP</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};