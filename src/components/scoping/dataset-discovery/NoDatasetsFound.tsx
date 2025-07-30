import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Database,
  RefreshCw,
  Lightbulb,
  Info,
  ExternalLink,
  FileText,
} from "lucide-react";

interface NoDatasetsFoundProps {
  domain?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
  hasError?: boolean;
}

export const NoDatasetsFound = ({
  domain = "",
  onRetry,
  isRetrying = false,
  hasError = false,
}: NoDatasetsFoundProps) => {
  const domainName = domain
    .replace("_", " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());

  const manualSearchSources = [
    {
      name: "Humanitarian Data Exchange",
      url: "https://data.humdata.org/",
      description: "Global platform for humanitarian data sharing",
    },
    {
      name: "World Bank Open Data",
      url: "https://data.worldbank.org/",
      description: "Development indicators and economic data",
    },
    {
      name: "UN Data",
      url: "http://data.un.org/",
      description: "Statistical databases from UN system",
    },
    {
      name: "UNICEF Data",
      url: "https://data.unicef.org/",
      description: "Child-focused indicators and surveys",
    },
    {
      name: "WHO Global Health Observatory",
      url: "https://www.who.int/data/gho",
      description: "Global health statistics and indicators",
    },
    {
      name: "UNHCR Global Focus",
      url: "https://reporting.unhcr.org/",
      description: "Refugee and displacement data",
    },
  ];

  if (isRetrying) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        <span className="ml-3 text-muted-foreground">Searching humanitarian data sources...</span>
      </div>
    );
  }

  return (
    <Card className="border-dashed border-2">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-muted">
          <Database className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-foreground">
          {hasError ? "Dataset Search Failed" : "No Datasets Found from Humanitarian Sources"}
        </h3>
        <p className="text-muted-foreground">
          {hasError ? (
            "We encountered an issue while searching for datasets. Please try again or proceed with your own data collection plan."
          ) : (
            <>
              We searched humanitarian data repositories but couldn't find datasets matching your project requirements{domain ? ` in ${domainName}` : ""}.
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
                  This could be due to network connectivity or data service maintenance. You can try searching again or proceed with your project planning.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border p-4 bg-muted/50">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-foreground mb-1">This is common for specialized AI projects</h4>
                <p className="text-sm text-muted-foreground">
                  Many successful humanitarian AI projects require custom data collection or partnerships with organizations that have relevant datasets.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-lg border p-4 bg-muted/50">
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-medium text-foreground mb-2">Try searching these humanitarian data sources manually:</h4>
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
              <h4 className="font-medium text-foreground mb-2">Alternative data strategies:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Contact humanitarian organizations directly for data partnerships</li>
                <li>• Use publicly available datasets from government sources</li>
                <li>• Consider synthetic or simulated data for initial development</li>
                <li>• Plan your own data collection strategy</li>
                <li>• Explore academic datasets in your domain</li>
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
        </div>

        <div className="text-xs text-center text-muted-foreground pt-4 border-t">
          <p>Automatically searched: Humanitarian Data Exchange (HDX) • Verified Humanitarian Sources</p>
        </div>
      </CardContent>
    </Card>
  );
};