import { useState, useEffect } from "react";
import { TopBar } from "@/components/TopBar";
import { useNavigate } from "react-router-dom";
import { BackButton } from "@/components/BackButton";
import { Footer } from "@/components/Footer";
import { usePageTitle } from "@/hooks/usePageTitle";
import { projectStorage, StoredProject } from "@/lib/project-storage";
import { ArrowRight } from "lucide-react";

const MyProjects = () => {
  usePageTitle("My Projects");

  const navigate = useNavigate();
  const [projects, setProjects] = useState<StoredProject[]>([]);

  useEffect(() => {
    const storedProjects = projectStorage.getAll();
    setProjects(storedProjects);
  }, []);

  const handleProjectClick = (projectId: string) => {
    navigate(`/project-blueprint?projectId=${projectId}`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar />
      <div className="container mx-auto px-4 py-12 pt-24 flex-grow">
        <div className="flex items-center mb-8">
          <BackButton />
          <h1 className="text-3xl font-bold text-foreground ml-3">
            My Projects
          </h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="group rounded-lg border border-border hover:border-primary/50 transition-all cursor-pointer bg-card shadow-card-light dark:shadow-card-dark hover:shadow-lg"
              onClick={() => handleProjectClick(project.id)}
            >
              <div className="p-4 md:p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-primary to-primary/60 flex-shrink-0 mt-1"></div>
                  <time className="text-xs text-muted-foreground font-medium">
                    {new Date(project.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </time>
                </div>

                <h3 className="text-base md:text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {project.title}
                </h3>

                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {project.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-xs font-medium text-muted-foreground">
                      Ready to continue
                    </span>
                  </div>

                  <div className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MyProjects;
