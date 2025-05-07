
import { useState } from "react";

const HomePage = () => {
  // Example of projects data - would come from an API in a real app
  const [projects] = useState([
    { id: 1, name: "Portfolio Website", image: "https://via.placeholder.com/300x200/0F0F0F/FFFFFF?text=Portfolio" },
    { id: 2, name: "Recipe Finder App", image: "https://via.placeholder.com/300x200/0F0F0F/FFFFFF?text=Recipes" },
    { id: 3, name: "Task Manager", image: "https://via.placeholder.com/300x200/0F0F0F/FFFFFF?text=Tasks" },
    { id: 4, name: "Weather Dashboard", image: "https://via.placeholder.com/300x200/0F0F0F/FFFFFF?text=Weather" },
  ]);

  const [suggestions] = useState([
    "Kanban board",
    "Startup dashboard", 
    "Music player",
    "3D product viewer"
  ]);

  return (
    <div className="pt-20 min-h-screen gradient-bg">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center mb-16 animate-fade">
          <h1 className="text-5xl font-bold mb-6 text-white">
            Build something <span className="text-sidebar-primary">Lovable</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Idea to app in seconds, with your personal full stack engineer
          </p>

          <div className="bg-black/30 backdrop-blur-md rounded-xl p-6 mb-8 border border-white/10">
            <div className="text-left text-gray-300 mb-2 flex items-center">
              <div className="w-8 h-8 bg-sidebar-primary rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                L
              </div>
              <div className="flex-grow">
                <input 
                  type="text" 
                  placeholder="Ask Lovable to create a portfolio website for my..." 
                  className="w-full bg-transparent border-none outline-none text-white placeholder-gray-500"
                />
              </div>
            </div>
            <div className="flex justify-between mt-8">
              <button className="text-gray-400 hover:text-white transition-colors">
                Attach
              </button>
              <button className="text-gray-400 hover:text-white transition-colors">
                Public
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {suggestions.map((suggestion, index) => (
              <div 
                key={index} 
                className="bg-black/30 backdrop-blur-sm text-white px-4 py-2 rounded-full border border-white/10 hover:bg-black/50 cursor-pointer transition-all"
              >
                {suggestion}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-black/40 backdrop-blur-md rounded-2xl p-8 border border-white/10 animate-fade">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">My Projects</h2>
            <button className="text-gray-400 hover:text-white transition-colors">
              View All
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {projects.map((project) => (
              <div 
                key={project.id}
                className="rounded-lg overflow-hidden bg-black/50 border border-white/10 hover:border-sidebar-primary/50 transition-all cursor-pointer"
              >
                <img 
                  src={project.image} 
                  alt={project.name} 
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-medium text-white">{project.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
