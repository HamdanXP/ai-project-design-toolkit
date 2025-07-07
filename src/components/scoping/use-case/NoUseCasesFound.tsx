import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Search,
  RefreshCw,
  Lightbulb,
  ArrowRight,
  Info,
  ExternalLink,
  BookOpen,
} from "lucide-react";

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
  hasError = false, // NEW: Default to false for no error state
}: NoUseCasesFoundProps) => {
  const domainName = domain
    .replace("_", " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());

  // Manual search suggestions based on domain
  const manualSearchSources = [
    {
      name: "Google Scholar",
      url: `https://scholar.google.com/`,
      description: "Comprehensive academic search across all publishers",
    },
    {
      name: "Papers with Code",
      url: `https://paperswithcode.com/`,
      description: "AI research papers with implementation code",
    },
    {
      name: "IEEE Xplore",
      url: `https://ieeexplore.ieee.org/`,
      description: "Engineering and technical research papers",
    },
    {
      name: "ACM Digital Library",
      url: `https://dl.acm.org/`,
      description: "Computer science and computing research",
    },
    {
      name: "ResearchGate",
      url: `https://www.researchgate.net/`,
      description: "Research collaboration network with practical insights",
    },
    {
      name: "Towards Data Science",
      url: `https://towardsdatascience.com/`,
      description: "Practical AI and ML implementation articles",
    },
  ];

 if (isRetrying) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        <span className="ml-3 text-muted-foreground">Searching for AI use cases...</span>
      </div>
    );
  }

  return (
    <Card className="border-dashed border-2">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-muted">
          <Search className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-foreground">
          {hasError ? "Search Failed" : "No Existing AI Use Cases Found"}
        </h3>
        <p className="text-muted-foreground">
          {hasError ? (
            "We encountered an issue while searching for AI use cases. Please try again or continue without a specific use case."
          ) : (
            <>
              We searched academic papers and AI research databases but couldn't find documented AI solutions.
            </>
          )}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">

        {hasError ? (
          <div className="rounded-lg border p-4 bg-destructive/10 border-destructive">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-destructive mb-1">Search temporarily unavailable</h4>
                <p className="text-sm text-destructive">
                  This could be due to network connectivity or search service maintenance. You can try searching again or continue with your project.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border p-4 bg-muted/50">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-foreground mb-1">This is actually quite common</h4>
                <p className="text-sm text-muted-foreground">
                  Many successful AI projects start without existing documented use cases. You might be pioneering a new application of AI in your domain.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-lg border p-4 bg-muted/50">
          <div className="flex items-start gap-3">
            <BookOpen className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-medium text-foreground mb-2">Try searching these sources manually:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {manualSearchSources.map((source, index) => (
                  <a
                    key={index}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 rounded border bg-background hover:bg-accent transition-colors text-sm group"
                  >
                    <ExternalLink className="h-3 w-3 text-green-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground group-hover:text-green-700">
                        {source.name}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {source.description}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border p-4 bg-muted/50">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-foreground mb-2">You can still proceed by:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
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
              <RefreshCw className={`h-4 w-4 ${isRetrying ? "animate-spin" : ""}`} />
              {isRetrying ? "Searching..." : "Search Again"}
            </Button>
          )}
          {onContinueWithoutUseCase && (
            <Button onClick={onContinueWithoutUseCase} className="flex items-center gap-2">
              Continue Without Use Case
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="text-xs text-center text-muted-foreground pt-4 border-t">
          <p>Automatically searched: arXiv • OpenAlex • Semantic Scholar</p>
        </div>
      </CardContent>
    </Card>
  );
};