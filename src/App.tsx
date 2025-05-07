
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { ThemeProvider } from "./components/ThemeProvider";
import MyProjects from "./pages/MyProjects";
import ProjectDetails from "./pages/ProjectDetails";
import ProjectCompletion from "./pages/ProjectCompletion";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import FAQ from "./pages/FAQ";
import ReflectionPhasePage from "./pages/phases/ReflectionPhasePage";
import ScopingPhasePage from "./pages/phases/ScopingPhasePage";
import DevelopmentPhasePage from "./pages/phases/DevelopmentPhasePage";
import EvaluationPhasePage from "./pages/phases/EvaluationPhasePage";

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/project/:projectId" element={<ProjectDetails />} />
              <Route path="/project/phases/reflection" element={<ReflectionPhasePage />} />
              <Route path="/project/phases/scoping" element={<ScopingPhasePage />} />
              <Route path="/project/phases/development" element={<DevelopmentPhasePage />} />
              <Route path="/project/phases/evaluation" element={<EvaluationPhasePage />} />
              <Route path="/project-completion" element={<ProjectCompletion />} />
              <Route path="/my-projects" element={<MyProjects />} />
              <Route path="/sign-in" element={<SignIn />} />
              <Route path="/sign-up" element={<SignUp />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/faq" element={<FAQ />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
