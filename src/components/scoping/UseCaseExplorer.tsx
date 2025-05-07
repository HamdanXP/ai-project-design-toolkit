
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Bookmark } from "lucide-react";
import { UseCase } from "@/types/scoping-phase";
import { useToast } from "@/hooks/use-toast";

type UseCaseExplorerProps = {
  useCases: UseCase[];
  loadingUseCases: boolean;
  selectedUseCase: UseCase | null;
  handleSelectUseCase: (useCase: UseCase) => void;
  moveToNextStep: () => void;
};

export const UseCaseExplorer = ({
  useCases,
  loadingUseCases,
  selectedUseCase,
  handleSelectUseCase,
  moveToNextStep,
}: UseCaseExplorerProps) => {
  const { toast } = useToast();

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center text-xl font-semibold">
          <span className="bg-primary text-primary-foreground rounded-full h-7 w-7 flex items-center justify-center mr-2 text-sm">1</span>
          AI Use Case Explorer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-6">Explore different AI approaches that could help address your problem. Select one that best aligns with your project goals.</p>
        
        {loadingUseCases ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="border border-border">
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-2/3 mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-5/6" />
                  <div className="flex mt-3 gap-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {useCases.map(useCase => (
              <Card 
                key={useCase.id} 
                className={`border cursor-pointer transition-all hover:shadow-md ${useCase.selected ? 'border-primary bg-primary/5' : 'border-border'}`}
                onClick={() => handleSelectUseCase(useCase)}
              >
                <CardContent className="p-4">
                  <h3 className="font-medium text-lg mb-2">{useCase.title}</h3>
                  <p className="text-muted-foreground text-sm mb-3">{useCase.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {useCase.tags.map(tag => (
                      <div key={tag} className="bg-secondary/20 text-secondary-foreground px-2 py-1 rounded-full text-xs">
                        {tag}
                      </div>
                    ))}
                  </div>
                  <Button 
                    variant={useCase.selected ? "default" : "outline"} 
                    size="sm"
                    className="mt-3"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectUseCase(useCase);
                    }}
                  >
                    <Bookmark className="h-4 w-4 mr-2" />
                    {useCase.selected ? "Selected" : "Select Use Case"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          {selectedUseCase ? `Selected: ${selectedUseCase.title}` : "No use case selected"}
        </div>
        <Button onClick={moveToNextStep} disabled={!selectedUseCase}>
          Next Step <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};
