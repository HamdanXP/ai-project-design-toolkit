
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { PipelineType } from "@/types/development-phase";

type PipelineOption = {
  id: PipelineType;
  title: string;
  description: string;
  useCases: string[];
  modelTypes: string[];
};

const pipelineOptions: PipelineOption[] = [
  {
    id: "classification",
    title: "Classification",
    description: "Categorize data into predefined classes",
    useCases: ["Sentiment analysis", "Spam detection", "Disease diagnosis"],
    modelTypes: ["Logistic Regression", "Random Forest", "Neural Networks"]
  },
  {
    id: "regression",
    title: "Regression",
    description: "Predict continuous values from input features",
    useCases: ["Price prediction", "Sales forecasting", "Risk assessment"],
    modelTypes: ["Linear Regression", "Decision Trees", "Support Vector Machines"]
  },
  {
    id: "forecasting",
    title: "Forecasting",
    description: "Predict future values based on historical data",
    useCases: ["Demand forecasting", "Weather prediction", "Stock prices"],
    modelTypes: ["ARIMA", "Prophet", "LSTM Networks"]
  },
  {
    id: "clustering",
    title: "Clustering",
    description: "Group similar data points together",
    useCases: ["Customer segmentation", "Anomaly detection", "Image segmentation"],
    modelTypes: ["K-Means", "DBSCAN", "Hierarchical Clustering"]
  },
  {
    id: "nlp",
    title: "Natural Language Processing",
    description: "Process and analyze text data",
    useCases: ["Text summarization", "Language translation", "Chatbots"],
    modelTypes: ["BERT", "Transformer models", "Word Embeddings"]
  },
  {
    id: "computer-vision",
    title: "Computer Vision",
    description: "Analyze and interpret visual information",
    useCases: ["Image recognition", "Object detection", "Face recognition"],
    modelTypes: ["CNN", "YOLO", "ResNet"]
  },
  {
    id: "tabular",
    title: "Tabular Data",
    description: "Process structured data in table format",
    useCases: ["Customer churn prediction", "Credit scoring", "Recommendation systems"],
    modelTypes: ["Gradient Boosting", "TabNet", "AutoML"]
  }
];

type AIPipelineSelectorProps = {
  selectedPipeline: PipelineType | null;
  setSelectedPipeline: ((pipeline: PipelineType) => void) | undefined;
  moveToNextStep: () => void;
};

export const AIPipelineSelector = ({ 
  selectedPipeline, 
  setSelectedPipeline,
  moveToNextStep 
}: AIPipelineSelectorProps) => {
  const isReadOnly = !setSelectedPipeline;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select AI Pipeline Type</CardTitle>
          <CardDescription>
            Choose the most appropriate AI pipeline for your use case
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pipelineOptions.map((option) => (
              <Card 
                key={option.id}
                className={`cursor-pointer border-2 transition-all ${
                  selectedPipeline === option.id 
                    ? 'border-primary bg-primary/5' 
                    : 'hover:border-primary/50'
                }`}
                onClick={() => {
                  if (setSelectedPipeline && !isReadOnly) {
                    setSelectedPipeline(option.id);
                  }
                }}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{option.title}</CardTitle>
                  <CardDescription>{option.description}</CardDescription>
                </CardHeader>
                <CardContent className="pb-2 pt-0">
                  <div>
                    <h4 className="font-medium text-sm">Common Use Cases:</h4>
                    <ul className="text-sm list-disc pl-5 text-muted-foreground">
                      {option.useCases.map((useCase, idx) => (
                        <li key={idx}>{useCase}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <div>
                    <h4 className="font-medium text-sm">Model Types:</h4>
                    <p className="text-xs text-muted-foreground">{option.modelTypes.join(", ")}</p>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            onClick={moveToNextStep}
            disabled={!selectedPipeline}
          >
            Next <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
