import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/useToast";
import { api, Project } from "@/lib/api";

export const useProjectDetails = (projectId?: string) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [project, setProject] = useState<Project | null>(null);
  const [editedProject, setEditedProject] = useState<Project | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchProjectDetails = async () => {
    if (!projectId) return;
    setIsLoading(true);
    try {
      const projectData = await api.projects.getById(projectId);
      setProject(projectData);
      setEditedProject(projectData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load project details.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const handleContinueProject = () => {
    if (!projectId) return;
    navigate(`/project-blueprint?projectId=${projectId}`);
  };

  const handleSave = async () => {
    if (!editedProject || !projectId) return;
    try {
      const updatedProject = await api.projects.update(projectId, {
        name: editedProject.name,
        description: editedProject.description,
        tags: editedProject.tags,
      });
      setProject(updatedProject);
      setIsEditing(false);
      toast({
        title: "Changes saved",
        description: "Your project details have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save project changes.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setEditedProject(project);
    setIsEditing(false);
  };

  const handleTagAdd = () => {
    if (!editedProject) return;
    if (newTag.trim() && !editedProject.tags.includes(newTag.trim())) {
      setEditedProject({
        ...editedProject,
        tags: [...editedProject.tags, newTag.trim()],
      });
      setNewTag("");
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    if (!editedProject) return;
    setEditedProject({
      ...editedProject,
      tags: editedProject.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleRevisePhase = (phaseName: string) => {
    if (!projectId) return;
    const phaseId = phaseName.toLowerCase();
    navigate(`/project-blueprint?projectId=${projectId}&phaseId=${phaseId}`);
    toast({
      title: "Phase selected",
      description: `You are now revising the ${phaseName} phase.`,
    });
  };

  return {
    project,
    editedProject,
    setEditedProject,
    isEditing,
    setIsEditing,
    newTag,
    setNewTag,
    isLoading,
    handleContinueProject,
    handleSave,
    handleCancel,
    handleTagAdd,
    handleTagRemove,
    handleRevisePhase,
  };
};

export type UseProjectDetailsReturn = ReturnType<typeof useProjectDetails>;
