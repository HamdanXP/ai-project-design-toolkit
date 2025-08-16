import { Github, Twitter, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Footer = () => {
  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center mb-4">
              <div className="text-primary font-bold text-lg flex items-center">
                <div className="mr-1 text-primary-foreground bg-primary rounded-md w-7 h-7 flex items-center justify-center">
                  A
                </div>
                <span>APDT</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              An AI-powered assistant that helps professionals design AI
              solutions
            </p>
          </div>

          <div className="col-span-1">
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://www.unesco.org/en/artificial-intelligence/recommendation-ethics"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  UNESCO AI Ethics Standards
                </a>
              </li>
              <li>
                <a
                  href="https://nethope.org/toolkits/humanitarian-ai-code-of-conduct/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Humanitarian AI Code of Conduct
                </a>
              </li>
              <li>
                <a
                  href="https://www.microsoft.com/en-us/ai/ai-for-humanitarian-action-projects"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  AI Case Studies & Examples
                </a>
              </li>
              <li>
                <a
                  href="https://reliefweb.int/topic/artificial-intelligence-humanitarian-action"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  AI in Humanitarian Action Hub
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-6 text-sm text-muted-foreground text-center">
          <p>
            © {new Date().getFullYear()} AI Project Design Toolkit. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
