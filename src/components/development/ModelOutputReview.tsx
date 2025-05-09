
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, ArrowRight, Upload, Image } from "lucide-react";
import { ModelOutput } from "@/types/development-phase";

type ModelOutputReviewProps = {
  modelOutput: ModelOutput;
  setModelOutput: ((output: ModelOutput) => void) | undefined;
  moveToPreviousStep: () => void;
  moveToNextStep: () => void;
};

export const ModelOutputReview = ({
  modelOutput,
  setModelOutput,
  moveToPreviousStep,
  moveToNextStep
}: ModelOutputReviewProps) => {
  const isReadOnly = !setModelOutput;
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Handler for updating different aspects of the model output
  const handleUpdateOutput = <K extends keyof ModelOutput>(
    field: K, 
    value: ModelOutput[K]
  ) => {
    if (isReadOnly) return;
    setModelOutput({ ...modelOutput, [field]: value });
  };

  // Simulate image upload button click
  const handleUploadButtonClick = () => {
    if (isReadOnly) return;
    setUploadingImage(true);
    
    // Simulate successful upload after delay
    setTimeout(() => {
      handleUpdateOutput('hasScreenshot', true);
      setUploadingImage(false);
    }, 1500);
  };

  // Check if some output has been provided
  const hasProvidedOutput = !!(
    modelOutput.performance || 
    modelOutput.samplePredictions || 
    modelOutput.issues ||
    modelOutput.hasScreenshot
  );
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Model Output Review</CardTitle>
          <CardDescription>
            Document and review your model's performance and results
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="performance">Model Performance Metrics</Label>
            <Textarea
              id="performance"
              placeholder="Enter model accuracy, F1 score, RMSE, etc..."
              value={modelOutput.performance || ""}
              onChange={(e) => handleUpdateOutput("performance", e.target.value)}
              disabled={isReadOnly}
              className="resize-none"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Example: "Accuracy: 0.92, Precision: 0.89, Recall: 0.95, F1 Score: 0.92"
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="sample-predictions">Sample Predictions</Label>
            <Textarea
              id="sample-predictions"
              placeholder="Enter some example predictions from your model..."
              value={modelOutput.samplePredictions || ""}
              onChange={(e) => handleUpdateOutput("samplePredictions", e.target.value)}
              disabled={isReadOnly}
              className="resize-none"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Include a few representative examples of correct and incorrect predictions.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="issues">Observed Issues or Limitations</Label>
            <Textarea
              id="issues"
              placeholder="Document any problems, limitations, or edge cases discovered..."
              value={modelOutput.issues || ""}
              onChange={(e) => handleUpdateOutput("issues", e.target.value)}
              disabled={isReadOnly}
              className="resize-none"
              rows={3}
            />
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Upload Screenshot or Graph</Label>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2"
                onClick={handleUploadButtonClick}
                disabled={isReadOnly || uploadingImage || modelOutput.hasScreenshot}
              >
                {uploadingImage ? (
                  <span>Uploading...</span>
                ) : modelOutput.hasScreenshot ? (
                  <span>Uploaded</span>
                ) : (
                  <>
                    <Upload className="h-4 w-4" /> Upload
                  </>
                )}
              </Button>
            </div>
            
            {modelOutput.hasScreenshot && (
              <div className="border rounded-md p-4 bg-muted/20 flex items-center justify-center">
                <div className="flex flex-col items-center text-muted-foreground">
                  <Image className="h-8 w-8 mb-2" />
                  <span>Screenshot uploaded</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2 pt-4">
            <Switch
              id="impact-goal"
              checked={modelOutput.meetsImpactGoal}
              onCheckedChange={(checked) => handleUpdateOutput("meetsImpactGoal", checked)}
              disabled={isReadOnly}
            />
            <Label htmlFor="impact-goal">Model meets intended impact goals</Label>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={moveToPreviousStep}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          <Button onClick={moveToNextStep} disabled={!hasProvidedOutput}>
            Next <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
