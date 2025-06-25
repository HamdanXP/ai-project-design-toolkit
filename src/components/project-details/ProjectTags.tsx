import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tag, X } from "lucide-react";

export interface ProjectTagsProps {
  isEditing: boolean;
  tags: string[];
  editedTags: string[];
  newTag: string;
  onNewTagChange: (value: string) => void;
  onTagAdd: () => void;
  onTagRemove: (tag: string) => void;
}

export const ProjectTags = ({
  isEditing,
  tags,
  editedTags,
  newTag,
  onNewTagChange,
  onTagAdd,
  onTagRemove
}: ProjectTagsProps) => {
  return (
    <Card className="shadow-card-light dark:shadow-card-dark mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Tags</CardTitle>
        <CardDescription>
          Project categories and technologies
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 md:p-6 pt-0">
        {isEditing ? (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {editedTags.map((tag) => (
                <div
                  key={tag}
                  className="bg-accent/50 text-foreground px-2.5 py-1.5 rounded-full border border-border text-xs flex items-center gap-1"
                >
                  {tag}
                  <button
                    onClick={() => onTagRemove(tag)}
                    className="ml-1 text-muted-foreground hover:text-foreground"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag..."
                value={newTag}
                onChange={(e) => onNewTagChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onTagAdd();
                    e.preventDefault();
                  }
                }}
                className="flex-1"
              />
              <Button onClick={onTagAdd} size="sm">
                <Tag size={16} className="mr-1" /> Add
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <div
                key={tag}
                className="bg-accent/50 text-foreground px-2.5 py-1.5 rounded-full border border-border text-xs"
              >
                {tag}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

