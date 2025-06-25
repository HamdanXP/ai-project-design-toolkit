import { useState, useRef } from "react";

export type AssistantMessage = {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
};

export function useAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: "welcome",
      content: "Hello! I'm your AI assistant. How can I help you with your project today?",
      sender: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleAssistant = () => setIsOpen((prev) => !prev);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage: AssistantMessage = {
      id: Date.now().toString(),
      content: message,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsTyping(true);

    setTimeout(() => {
      const aiResponse: AssistantMessage = {
        id: (Date.now() + 1).toString(),
        content:
          "This is a simulated response. In a production environment, this would connect to an AI assistant API.",
        sender: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
      scrollToBottom();
    }, 1000);

    setTimeout(scrollToBottom, 100);
  };

  return {
    isOpen,
    messages,
    message,
    setMessage,
    isTyping,
    messagesEndRef,
    toggleAssistant,
    handleSubmit,
  };
}

