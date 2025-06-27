import React, { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  ExternalLink, 
  RefreshCw,
  Eye,
  Users,
  Lock,
  Scale,
  Heart
} from "lucide-react";
import { useProject } from "@/contexts/ProjectContext";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "react-router-dom";
import { EthicalConsideration } from "@/types/project";

interface EthicalConsiderationsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onContinue: () => void;
}

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'data_protection':
    case 'privacy':
      return <Lock className="h-4 w-4" />;
    case 'bias_fairness':
      return <Scale className="h-4 w-4" />;
    case 'transparency':
      return <Eye className="h-4 w-4" />;
    case 'accountability':
      return <CheckCircle className="h-4 w-4" />;
    case 'safety':
      return <Shield className="h-4 w-4" />;
    case 'do_no_harm':
      return <Heart className="h-4 w-4" />;
    default:
      return <Users className="h-4 w-4" />;
  }
};

const getPriorityVariant = (priority: string) => {
  switch (priority.toLowerCase()) {
    case 'high':
      return 'destructive';
    case 'medium':
      return 'default';
    case 'low':
      return 'secondary';
    default:
      return 'default';
  }
};

// Helper function to format document title from filename
const formatDocumentTitle = (filename: string): string => {
  if (!filename) return "Unknown Document";
  
  // Remove file extension
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
  
  // Replace underscores and hyphens with spaces
  const formatted = nameWithoutExt
    .replace(/[_-]/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  
  return formatted;
};

export const EthicalConsiderationsModal: React.FC<EthicalConsiderationsModalProps> = ({
  isOpen,
  onOpenChange,
  onContinue
}) => {
  const { 
    ethicalConsiderations, 
    ethicalConsiderationsAcknowledged,
    acknowledgeEthicalConsiderations,
    refreshEthicalConsiderations
  } = useProject();
  const { toast } = useToast();
  const location = useLocation();
  
  const searchParams = new URLSearchParams(location.search);
  const projectId = searchParams.get('projectId');
  
  const [acknowledgedItems, setAcknowledgedItems] = useState<string[]>([]);
  const [isAcknowledging, setIsAcknowledging] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Initialize acknowledged items from existing data
  useEffect(() => {
    const alreadyAcknowledged = ethicalConsiderations
      .filter(consideration => consideration.acknowledged)
      .map(consideration => consideration.id);
    setAcknowledgedItems(alreadyAcknowledged);
  }, [ethicalConsiderations]);

  const handleItemAcknowledge = (considerationId: string, checked: boolean) => {
    if (checked) {
      setAcknowledgedItems(prev => [...prev, considerationId]);
    } else {
      setAcknowledgedItems(prev => prev.filter(id => id !== considerationId));
    }
  };

  const handleAcknowledgeAll = async () => {
    setIsAcknowledging(true);
    try {
      await acknowledgeEthicalConsiderations(projectId, acknowledgedItems);
      
      toast({
        title: "Ethical Considerations Acknowledged",
        description: "You can review these again anytime before starting your project.",
      });
      
      onContinue();
    } catch (error) {
      toast({
        title: "Failed to Acknowledge",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAcknowledging(false);
    }
  };

  const handleRefresh = async () => {
    if (!projectId) {
      toast({
        title: "Cannot Refresh",
        description: "Refresh is only available for saved projects.",
        variant: "destructive"
      });
      return;
    }

    setIsRefreshing(true);
    try {
      await refreshEthicalConsiderations(projectId);
      toast({
        title: "Ethical Considerations Updated",
        description: "Latest guidelines have been loaded from our knowledge base.",
      });
    } catch (error) {
      toast({
        title: "Failed to Refresh",
        description: "Could not update ethical considerations.",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const allRequiredAcknowledged = ethicalConsiderations
    .filter(c => c.priority === 'high')
    .every(c => acknowledgedItems.includes(c.id));

  const hasAnyConsiderations = ethicalConsiderations.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Ethical Considerations for Your Project
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Review these ethical guidelines and considerations before starting your humanitarian AI project.
            {!hasAnyConsiderations && " No specific considerations were found, but you can still proceed."}
          </p>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-hidden">
          {!hasAnyConsiderations ? (
            // Empty state with refresh option
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Ethical Considerations Found</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-md">
                We couldn't retrieve specific ethical considerations for your project from our knowledge base. 
                This might be due to connectivity issues or if your project is in a new domain.
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                You can still proceed with your project and review general humanitarian AI ethics principles 
                during the reflection phase.
              </p>
              {/* Add refresh button to empty state */}
              {projectId !== 'current' && (
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Refreshing...' : 'Try Refresh'}
                </Button>
              )}
            </div>
          ) : (
            // Considerations content with proper scrolling
            <div className="h-full flex flex-col">
              {/* Summary */}
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg mb-4 flex-shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">
                    {ethicalConsiderations.length} Ethical Considerations Identified
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  High priority items must be acknowledged before proceeding.
                </p>
              </div>

              {/* Scrollable considerations list */}
              <ScrollArea className="flex-1">
                <div className="space-y-4 pr-4">
                  {ethicalConsiderations.map((consideration, index) => (
                    <Card key={consideration.id} className="border-l-4 border-l-blue-500">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(consideration.category)}
                            <CardTitle className="text-lg">{consideration.title}</CardTitle>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={getPriorityVariant(consideration.priority)}>
                              {consideration.priority}
                            </Badge>
                            <Checkbox
                              checked={acknowledgedItems.includes(consideration.id)}
                              onCheckedChange={(checked) => 
                                handleItemAcknowledge(consideration.id, checked as boolean)
                              }
                            />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                          {consideration.description}
                        </p>
                        
                        {consideration.why_important && (
                          <div className="bg-amber-50 dark:bg-amber-950 p-3 rounded-md">
                            <p className="text-sm text-amber-800 dark:text-amber-200">
                              <strong>Why this matters:</strong> {consideration.why_important}
                            </p>
                          </div>
                        )}

                        {consideration.actionable_steps.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium mb-2">Actionable Steps:</h5>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {consideration.actionable_steps.map((step, stepIndex) => (
                                <li key={stepIndex} className="flex items-start gap-2">
                                  <span className="text-blue-600 mt-1">•</span>
                                  {step}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="flex-1">
                            <div className="text-xs text-muted-foreground mb-1">
                              <strong>Source:</strong>{" "}
                              {consideration.source_url ? (
                                <a
                                  href={consideration.source_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1"
                                >
                                  {formatDocumentTitle(consideration.source_filename)}
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              ) : (
                                <span>{formatDocumentTitle(consideration.source_filename)}</span>
                              )}
                              {consideration.source_page && (
                                <span className="ml-1">(Page {consideration.source_page})</span>
                              )}
                            </div>
                            
                            {consideration.source_excerpt && consideration.source_excerpt.trim() && (
                              <div className="text-xs bg-muted/50 p-2 rounded italic border-l-2 border-muted mb-1">
                                "{consideration.source_excerpt}"
                              </div>
                            )}
                            
                            {consideration.source_updated && (
                              <div className="text-xs text-muted-foreground">
                                Updated: {new Date(consideration.source_updated).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>

                        {consideration.beneficiary_impact && (
                          <div className="mt-3 bg-green-50 dark:bg-green-950 p-3 rounded-md">
                            <p className="text-sm text-green-800 dark:text-green-200">
                              <strong>Impact on beneficiaries:</strong> {consideration.beneficiary_impact}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
          {hasAnyConsiderations ? (
            <>
              <div className="flex-1 text-xs text-muted-foreground">
                {acknowledgedItems.length} of {ethicalConsiderations.length} considerations acknowledged
                {!allRequiredAcknowledged && " (all high priority items required)"}
              </div>
              <Button
                onClick={handleAcknowledgeAll}
                disabled={!allRequiredAcknowledged || isAcknowledging}
                className="min-w-[120px]"
              >
                {isAcknowledging ? "Processing..." : "Acknowledge & Continue"}
              </Button>
            </>
          ) : (
            <Button onClick={onContinue} className="min-w-[120px]">
              Continue to Reflection
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};