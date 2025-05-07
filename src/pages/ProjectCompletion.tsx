
import { useNavigate } from "react-router-dom";
import { TopBar } from "@/components/TopBar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/BackButton";
import { CheckCircle, Share, Download, FileText } from "lucide-react";
import { Footer } from "@/components/Footer";

const ProjectCompletion = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar />
      <div className="container mx-auto px-4 py-12 pt-24 flex-grow">
        <div className="flex items-center mb-8">
          <BackButton />
          <h1 className="text-3xl font-bold text-foreground ml-3">Project Completed</h1>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <Card className="shadow-card-light dark:shadow-card-dark mb-8">
            <CardContent className="p-8 flex flex-col items-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              
              <h2 className="text-2xl font-semibold text-center mb-4">
                Congratulations! Your project is complete.
              </h2>
              
              <p className="text-muted-foreground text-center mb-8 max-w-lg">
                You've successfully completed all phases of your AI project design. 
                Your project blueprint is now ready for implementation or sharing with your team.
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center">
                <Button className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export as PDF
                </Button>
                
                <Button variant="outline" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  View Documentation
                </Button>
                
                <Button variant="outline" className="flex items-center gap-2">
                  <Share className="h-4 w-4" />
                  Share Project
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <h3 className="text-xl font-semibold mb-4">Project Summary</h3>
          
          <Card className="shadow-card-light dark:shadow-card-dark mb-6">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-lg mb-2">Reflection Phase</h4>
                  <p className="text-muted-foreground">
                    Identified key business needs, target users, and ethical considerations for the AI solution.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-lg mb-2">Scoping Phase</h4>
                  <p className="text-muted-foreground">
                    Defined project requirements, success metrics, and planned development timeline and resources.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-lg mb-2">Development Phase</h4>
                  <p className="text-muted-foreground">
                    Created a functional prototype with selected technologies and implemented iteration cycles.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-lg mb-2">Evaluation Phase</h4>
                  <p className="text-muted-foreground">
                    Evaluated performance against goals, identified risks, and incorporated user feedback.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={() => navigate('/project-blueprint')}>
              Review Project
            </Button>
            <Button onClick={() => navigate('/my-projects')}>
              Back to Projects
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProjectCompletion;
