const PROJECTS_STORAGE_KEY = 'ai-toolkit-projects';

export interface StoredProject {
  id: string;
  title: string;
  description: string;
  createdAt: string;
}

export const projectStorage = {
  getAll: (): StoredProject[] => {
    try {
      const stored = localStorage.getItem(PROJECTS_STORAGE_KEY);
      if (!stored) return [];
      return JSON.parse(stored);
    } catch (error) {
      console.warn('Error reading projects from localStorage:', error);
      return [];
    }
  },

  getFirst: (count: number): StoredProject[] => {
    return projectStorage.getAll().slice(0, count);
  },

  add: (project: Omit<StoredProject, 'image'>): StoredProject => {
    const projects = projectStorage.getAll();
    const newProject: StoredProject = {
      ...project,
    };
    
    projects.unshift(newProject);
    
    try {
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
    } catch (error) {
      console.warn('Error saving projects to localStorage:', error);
    }
    
    return newProject;
  },

  remove: (projectId: string): void => {
    const projects = projectStorage.getAll();
    const filtered = projects.filter(p => p.id !== projectId);
    
    try {
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.warn('Error removing project from localStorage:', error);
    }
  },

  clear: (): void => {
    try {
      localStorage.removeItem(PROJECTS_STORAGE_KEY);
    } catch (error) {
      console.warn('Error clearing projects from localStorage:', error);
    }
  }
};