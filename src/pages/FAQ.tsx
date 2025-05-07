
import { TopBar } from "@/components/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FAQ = () => {
  const navigate = useNavigate();
  
  const faqItems = [
    {
      question: "What is Lovable?",
      answer: "Lovable is an AI-powered platform that helps users build and deploy web applications quickly and easily. It combines the power of artificial intelligence with modern web development technologies."
    },
    {
      question: "How do I get started with Lovable?",
      answer: "To get started with Lovable, simply sign up for an account, create a new project, and follow the guided process to build your application. You can use pre-built templates or start from scratch."
    },
    {
      question: "Do I need coding experience to use Lovable?",
      answer: "No, you don't need coding experience to use Lovable. The platform is designed to be user-friendly for both developers and non-developers. However, having some basic understanding of web technologies can be helpful."
    },
    {
      question: "Can I export my project's code?",
      answer: "Yes, Lovable allows you to export your project's code. This gives you complete ownership and control over your application, allowing you to host it anywhere you want."
    },
    {
      question: "How does billing work?",
      answer: "Lovable offers various subscription plans based on your needs. We have free tiers for hobbyists and paid plans for professionals and businesses. You can find more details on our pricing page."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <div className="container mx-auto px-4 pt-20 md:pt-24 pb-8">
        <div className="flex items-center mb-6 gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-1" 
            onClick={() => navigate("/")}
          >
            <Home size={16} />
            <span>Home</span>
          </Button>
          <span className="text-muted-foreground">/</span>
          <span className="text-foreground">FAQ</span>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold mb-6">Frequently Asked Questions</h1>
          
          <Card className="mb-6 shadow-card-light dark:shadow-card-dark">
            <CardHeader>
              <CardTitle>Common Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqItems.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left font-medium">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
