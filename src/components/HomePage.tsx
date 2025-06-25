import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Image, Paperclip, File, X, Layers, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Footer } from "@/components/Footer";
import { useHomePage } from "@/hooks/useHomePage";


const HomePage = () => {
  const {
    inputValue,
    setInputValue,
    isAttachingFile,
    setIsAttachingFile,
    selectedFiles,
    isLoading,
    recentProjects,
    suggestions,
    handleInputChange,
    handleGoToBlueprint,
    handleSuggestionClick,
    handleViewAll,
    handleProjectClick,
    handleFileChange,
    handleRemoveFile
  } = useHomePage();
  return (
    <div className="pt-16 min-h-screen bg-background flex flex-col">
      <div className="container mx-auto px-4 py-6 md:py-12 flex-grow">
        <div className="max-w-3xl mx-auto text-center mb-8 md:mb-16 animate-fade">
          <div className="flex justify-center mb-6">
            <div className="text-primary-foreground bg-primary rounded-full w-16 h-16 flex items-center justify-center">
              <Layers className="h-8 w-8" />
            </div>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold mb-3 md:mb-6 text-foreground">
            AI Project Design <span className="text-primary">Toolkit</span>
          </h1>
          <p className="text-base md:text-xl text-muted-foreground mb-6 md:mb-8">
            An AI-powered assistant that helps professionals design AI solutions
          </p>

          <Card className="mb-4 md:mb-8 shadow-card-light dark:shadow-card-dark">
            <CardContent className="p-3 md:p-6">
              <div className="relative flex flex-col">
                <Textarea
                  id="prompt-input"
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder="Ask APDT to design an AI solution for..."
                  className="bg-transparent border-none outline-none text-foreground placeholder-muted-foreground text-sm md:text-base min-h-[40px] resize-none overflow-hidden"
                  onFocus={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = `${e.target.scrollHeight}px`;
                  }}
                />
                
                {selectedFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 mb-1">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 bg-accent/20 p-2 rounded-md">
                        <File className="h-4 w-4 text-primary" />
                        <span className="text-xs text-foreground truncate max-w-[150px]">{file.name}</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0 ml-auto" 
                          onClick={() => handleRemoveFile(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center justify-between mt-2">
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={() => setIsAttachingFile(!isAttachingFile)}
                    >
                      <Paperclip className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    
                    {isAttachingFile && (
                      <div className="absolute bottom-12 left-0 bg-card p-3 rounded-md shadow-md border border-border flex gap-2">
                        <label className="cursor-pointer flex flex-col items-center gap-1">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Image className="h-5 w-5 text-primary" />
                          </div>
                          <span className="text-xs">Images</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleFileChange}
                            multiple
                          />
                        </label>
                        
                        <label className="cursor-pointer flex flex-col items-center gap-1">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <File className="h-5 w-5 text-primary" />
                          </div>
                          <span className="text-xs">Files</span>
                          <input 
                            type="file" 
                            className="hidden" 
                            onChange={handleFileChange}
                            multiple
                          />
                        </label>
                      </div>
                    )}
                  </div>
                  <Button
                    className="rounded-full aspect-square p-1.5"
                    size="icon"
                    disabled={!inputValue.trim() || isLoading}
                    onClick={handleGoToBlueprint}
                  >
                    {isLoading ? (
                      <Loader2 className="size-4 animate-spin text-muted-foreground" />
                    ) : (
                      <ArrowRight className={`size-4 ${!inputValue.trim() ? 'text-muted-foreground' : ''}`} />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Suggestion buttons - using static suggestions that never change */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion.prompt)}
                className="bg-accent/50 text-foreground px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-full border border-border hover:bg-accent cursor-pointer transition-all text-xs whitespace-normal text-left"
              >
                {suggestion.title}
              </button>
            ))}
          </div>
        </div>

        <Card className="shadow-card-light dark:shadow-card-dark animate-fade">
          <CardContent className="p-4 md:p-8">
            <div className="flex justify-between items-center mb-4 md:mb-6">
              <h2 className="text-lg md:text-2xl font-bold text-foreground">My Projects</h2>
              <Button 
                variant="ghost" 
                className="text-muted-foreground hover:text-foreground transition-colors text-sm md:text-base"
                onClick={handleViewAll}
              >
                View All
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
              {/* Existing Projects */}
              {recentProjects.map((project) => (
                <div 
                  key={project.id}
                  className="rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-all cursor-pointer bg-card shadow-card-light dark:shadow-card-dark"
                  onClick={() => handleProjectClick(project.id)}
                >
                  <img 
                    src={project.image} 
                    alt={project.name} 
                    className="w-full h-24 md:h-40 object-cover"
                  />
                  <div className="p-3 md:p-4">
                    <h3 className="text-sm md:text-lg font-medium text-foreground">{project.name}</h3>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default HomePage;
