
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import Index from "@/pages/Index";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import NotFound from "@/pages/NotFound";
import Profile from "@/pages/Profile";
import FAQ from "@/pages/FAQ";
import Settings from "@/pages/Settings";
import { ProjectProvider } from "@/contexts/ProjectContext";
import ProjectBlueprint from "@/pages/ProjectBlueprint";
import MyProjects from "@/pages/MyProjects";
import ProjectCompletion from "@/pages/ProjectCompletion";
import ProjectDetails from "@/pages/ProjectDetails";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/settings" element={<Settings />} />
          <Route 
            path="/project-blueprint" 
            element={
              <ProjectProvider>
                <ProjectBlueprint />
              </ProjectProvider>
            } 
          />
          <Route path="/my-projects" element={<MyProjects />} />
          <Route path="/project-completion" element={<ProjectCompletion />} />
          <Route path="/project/:projectId" element={<ProjectDetails />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
