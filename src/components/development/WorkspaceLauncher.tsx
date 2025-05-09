
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, ArrowRight, ExternalLink, Code, Notebook } from "lucide-react";
import { WorkspaceType } from "@/types/development-phase";

type WorkspaceLauncherProps = {
  selectedWorkspace: WorkspaceType | null;
  setSelectedWorkspace: ((workspace: WorkspaceType) => void) | undefined;
  moveToPreviousStep: () => void;
  moveToNextStep: () => void;
};

export const WorkspaceLauncher = ({
  selectedWorkspace,
  setSelectedWorkspace,
  moveToPreviousStep,
  moveToNextStep
}: WorkspaceLauncherProps) => {
  const isReadOnly = !setSelectedWorkspace;
  
  // Handler for selecting workspace type
  const handleSelectWorkspace = (workspace: WorkspaceType) => {
    if (isReadOnly) return;
    setSelectedWorkspace(workspace);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Development Workspace</CardTitle>
          <CardDescription>
            Choose how you want to build your AI solution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs 
            value={selectedWorkspace || "no-code"} 
            onValueChange={(value) => handleSelectWorkspace(value as WorkspaceType)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="no-code" disabled={isReadOnly}>No-Code Builder</TabsTrigger>
              <TabsTrigger value="notebook" disabled={isReadOnly}>Jupyter Notebook</TabsTrigger>
              <TabsTrigger value="external" disabled={isReadOnly}>External Platform</TabsTrigger>
            </TabsList>
            
            <TabsContent value="no-code" className="mt-6">
              <div className="bg-muted/50 p-6 rounded-md">
                <h3 className="font-medium text-lg mb-4">No-Code AI Solution Builder</h3>
                <p className="text-muted-foreground mb-4">
                  Build your AI solution using intuitive visual interfaces without writing code.
                  Perfect for rapid prototyping and testing basic concepts.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Data Processing</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      <p>Drag and drop data transformation blocks</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Model Building</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      <p>Configure pre-built model templates</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="notebook" className="mt-6">
              <div className="bg-muted/50 p-6 rounded-md">
                <h3 className="font-medium text-lg mb-4">Jupyter Notebook Environment</h3>
                <p className="text-muted-foreground mb-4">
                  Use Jupyter notebooks for interactive development with code cells, documentation, and visualizations.
                </p>
                <div className="flex justify-center">
                  <Button className="flex items-center gap-2" variant="outline">
                    <Notebook className="h-4 w-4" />
                    Launch Jupyter (External)
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-6 bg-background p-4 rounded-md border">
                  <h4 className="text-sm font-medium mb-2">Sample code to get started:</h4>
                  <pre className="text-xs p-3 bg-muted rounded overflow-auto">
                    <code>{`import pandas as pd
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split

# Load your data
df = pd.read_csv('your_data.csv')

# Explore the data
print(df.head())
print(df.describe())

# Visualize
plt.figure(figsize=(10, 6))
# Your visualization code here

# Split for training
X = df.drop('target', axis=1)
y = df['target']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)`}
                    </code>
                  </pre>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="external" className="mt-6">
              <div className="bg-muted/50 p-6 rounded-md">
                <h3 className="font-medium text-lg mb-4">External Development Platforms</h3>
                <p className="text-muted-foreground mb-4">
                  Use powerful cloud-based AI platforms to develop and deploy your solution.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="flex flex-col items-center h-auto p-4">
                    <ExternalLink className="h-5 w-5 mb-2" />
                    <span>Hugging Face</span>
                    <span className="text-xs text-muted-foreground mt-1">Model hub & deployment</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col items-center h-auto p-4">
                    <ExternalLink className="h-5 w-5 mb-2" />
                    <span>Google Colab</span>
                    <span className="text-xs text-muted-foreground mt-1">Free GPU notebooks</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col items-center h-auto p-4">
                    <ExternalLink className="h-5 w-5 mb-2" />
                    <span>Streamlit</span>
                    <span className="text-xs text-muted-foreground mt-1">Web app deployment</span>
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={moveToPreviousStep}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          <Button onClick={moveToNextStep} disabled={!selectedWorkspace}>
            Next <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
