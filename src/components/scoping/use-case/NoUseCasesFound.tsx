import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, RefreshCw, Lightbulb, ArrowRight, Info } from "lucide-react";

interface NoUseCasesFoundProps {
  domain: string;
  onRetry?: () => void;
  onContinueWithoutUseCase?: () => void;
  isRetrying?: boolean;
  hasError?: boolean; // NEW: Track if there was an error during search
}

export const NoUseCasesFound = ({ 
  domain, 
  onRetry, 
  onContinueWithoutUseCase,
  isRetrying = false,
  hasError = false // NEW: Default to false for no error state
}: NoUseCasesFoundProps) => {
  const domainName = domain.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  // Show loading state during retry (same as UseCaseExplorer)
  if (isRetrying) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3 text-muted-foreground">Searching for AI use cases...</span>
      </div>
    );
  }
  
  return (
    <Card className="border-dashed border-2">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
          <Search className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold">
          {hasError ? "Search Failed" : "No Existing AI Use Cases Found"}
        </h3>
        <p className="text-muted-foreground">
          {hasError ? (
            "We encountered an issue while searching for AI use cases. Please try again or continue without a specific use case."
          ) : (
            <>
              We searched academic papers, humanitarian reports, and datasets but couldn't find documented AI solutions specifically for <strong>{domainName}</strong>.
            </>
          )}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Show error-specific content or regular no-results content */}
        {hasError ? (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-orange-900 mb-1">Search temporarily unavailable</h4>
                <p className="text-sm text-orange-800">
                  This could be due to network connectivity or search service maintenance. You can try searching again or continue with your project.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">This is actually quite common</h4>
                <p className="text-sm text-blue-800">
                  Many successful AI projects start without existing documented use cases. You might be pioneering a new application of AI in your domain.
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-green-900 mb-2">You can still proceed by:</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Adapting AI techniques from related domains</li>
                <li>• Applying general machine learning principles to your problem</li>
                <li>• Creating an innovative solution tailored to your specific needs</li>
                <li>• Consulting with AI experts familiar with your sector</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
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
        
        <div className="text-xs text-center text-muted-foreground pt-4 border-t">
          <p>Searched: arXiv • ReliefWeb • Humanitarian Data Exchange • Semantic Scholar</p>
        </div>
      </CardContent>
    </Card>
  );
};