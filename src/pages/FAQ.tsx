import { TopBar } from "@/components/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BackButton } from "@/components/BackButton";

const FAQ = () => {
  const faqs = [
    {
      question: "What is AI Project Design Toolkit?",
      answer: "AI Project Design Toolkit is an AI-powered platform that helps professionals design AI solutions quickly and efficiently. It allows you to create responsible AI projects without extensive technical knowledge."
    },
    {
      question: "How do I get started with AI Project Design Toolkit?",
      answer: "To get started, simply sign up for an account, create a new project from the dashboard, and follow our guided setup process. You can choose from various templates or start from scratch."
    },
    {
      question: "What technologies does Lovable use?",
      answer: "Lovable is built on modern web technologies including React, TypeScript, and Tailwind CSS. It leverages these technologies to create performant and maintainable web applications."
    },
    {
      question: "Is Lovable suitable for beginners?",
      answer: "Yes! Lovable is designed to be accessible for users of all skill levels. Beginners can use our intuitive interface to create projects without diving into code, while advanced users can customize everything to their needs."
    },
    {
      question: "Can I collaborate with others on my projects?",
      answer: "Yes, Lovable supports team collaboration. You can invite team members to your projects and work together in real-time."
    },
    {
      question: "How do I deploy my Lovable project?",
      answer: "Lovable offers one-click deployment to various platforms. Simply navigate to the 'Deployment' section in your project settings and follow the instructions."
    },
    {
      question: "Is there a free plan available?",
      answer: "Yes, Lovable offers a free tier that allows you to create and deploy projects with some limitations. Paid plans offer additional features and resources."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <div className="container mx-auto px-4 pt-20 md:pt-24 pb-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center mb-6">
            <BackButton />
            <h1 className="text-2xl md:text-3xl font-bold ml-3">Frequently Asked Questions</h1>
          </div>
          
          <Card className="shadow-card-light dark:shadow-card-dark mb-6">
            <CardHeader>
              <CardTitle>Common Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-muted-foreground">{faq.answer}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
          
          <Card className="shadow-card-light dark:shadow-card-dark">
            <CardHeader>
              <CardTitle>Still have questions?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-muted-foreground">
                If you couldn't find the answer to your question, please reach out to our support team.
              </p>
              <div className="flex flex-wrap gap-3">
                <a href="#" className="text-primary hover:underline">Contact Support</a>
                <a href="#" className="text-primary hover:underline">Documentation</a>
                <a href="#" className="text-primary hover:underline">Community Forum</a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
