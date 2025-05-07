
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface DatasetSearchBarProps {
  searchTerm: string;
  selectedCategory: string;
  handleSearch: (term: string) => void;
  handleCategorySelect: (category: string) => void;
}

export const DatasetSearchBar = ({
  searchTerm,
  selectedCategory,
  handleSearch,
  handleCategorySelect,
}: DatasetSearchBarProps) => {
  return (
    <div className="flex-1 flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search datasets..."
          className="pl-9"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>
      
      <select 
        className="px-3 py-2 border border-input rounded-md bg-background"
        value={selectedCategory}
        onChange={(e) => handleCategorySelect(e.target.value)}
      >
        <option value="">All Categories</option>
        <option value="water">Water</option>
        <option value="disease">Health</option>
        <option value="agriculture">Agriculture</option>
        <option value="refugee">Migration</option>
        <option value="food">Food Security</option>
      </select>
    </div>
  );
};
