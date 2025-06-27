import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { QuestionGuidanceProps, GuidanceSource} from "@/types/reflection-phase";
import { 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  BookOpen, 
  HelpCircle,
  FileText
} from "lucide-react";

// Helper function to format document title from filename
const formatDocumentTitle = (filename: string): string => {
  if (!filename) return "Guidance Document";
  
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

// Helper function to get domain icon
const getDomainIcon = (domain: string) => {
  switch (domain.toLowerCase()) {
    case 'humanitarian_context':
      return <HelpCircle className="h-3 w-3" />;
    case 'ai_ethics':
      return <BookOpen className="h-3 w-3" />;
    case 'ai_technical':
      return <FileText className="h-3 w-3" />;
    default:
      return <FileText className="h-3 w-3" />;
  }
};

// Helper function to get domain color
const getDomainColor = (domain: string) => {
  switch (domain.toLowerCase()) {
    case 'humanitarian_context':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'ai_ethics':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'ai_technical':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

// Helper function to generate public source URL
const generateSourceUrl = (source: GuidanceSource): string => {
  if (!source.filename || !source.source_location) {
    return "";
  }
  return `https://storage.googleapis.com/${source.source_location}/${source.filename}`;
};

export const QuestionGuidance: React.FC<QuestionGuidanceProps> = ({
  questionKey,
  guidanceSources,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!guidanceSources || guidanceSources.length === 0) {
    return null;
  }

  return (
    <div className={`mt-2 ${className}`}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground p-2 h-auto"
          >
            <BookOpen className="h-4 w-4" />
            <span>View guidance sources ({guidanceSources.length})</span>
            {isOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="mt-2">
          <Card className="border border-muted">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <HelpCircle className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">
                    Guidance for answering this question:
                  </span>
                </div>
                
                {guidanceSources.map((source, index) => (
                  <div key={`${source.source_id}-${index}`} className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getDomainIcon(source.domain_context)}
                        <span className="text-sm font-medium">
                          {formatDocumentTitle(source.filename)}
                        </span>
                        {source.page && (
                          <span className="text-xs text-muted-foreground">
                            (Page {source.page})
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getDomainColor(source.domain_context)}`}
                        >
                          {source.domain_context.replace('_', ' ')}
                        </Badge>
                        
                        {generateSourceUrl(source) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => window.open(generateSourceUrl(source), '_blank')}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-muted/30 p-3 rounded-md text-sm text-muted-foreground">
                      {source.content.substring(0, 300)}
                      {source.content.length > 300 && '...'}
                    </div>
                    
                    {source.updated && (
                      <div className="text-xs text-muted-foreground">
                        Updated: {new Date(source.updated).toLocaleDateString()}
                      </div>
                    )}
                    
                    {index < guidanceSources.length - 1 && (
                      <div className="border-t border-muted my-3" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};