
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FeasibilityCategory as CategoryType } from "@/types/scoping-phase";
import { EnhancedConstraintTooltip } from "../common/EnhancedConstraintTooltip";

type FeasibilityCategoryProps = {
  category: CategoryType;
  onUpdateConstraint: (constraintId: string, value: string | boolean) => void;
};

export const FeasibilityCategory = ({ category, onUpdateConstraint }: FeasibilityCategoryProps) => {
  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div>
            <h3 className="text-lg font-semibold">{category.title}</h3>
            <p className="text-sm text-muted-foreground font-normal">{category.description}</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {category.constraints.map(constraint => (
            <div key={constraint.id} className="space-y-3 p-4 border rounded-lg bg-card/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <h4 className="font-medium">{constraint.label}</h4>
                  <EnhancedConstraintTooltip constraint={constraint} />
                </div>
                {constraint.importance && (
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    constraint.importance === 'critical' ? 'bg-red-100 text-red-700' :
                    constraint.importance === 'important' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {constraint.importance}
                  </span>
                )}
              </div>
              
              {constraint.helpText && (
                <p className="text-sm text-muted-foreground">{constraint.helpText}</p>
              )}
              
              <div className="space-y-2">
                {constraint.type === 'toggle' ? (
                  <div className="flex items-center space-x-3">
                    <Checkbox 
                      id={constraint.id}
                      checked={constraint.value as boolean} 
                      onCheckedChange={(checked) => onUpdateConstraint(constraint.id, !!checked)}
                    />
                    <label 
                      htmlFor={constraint.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Yes, I have this available
                    </label>
                  </div>
                ) : constraint.type === 'select' && constraint.options ? (
                  <Select 
                    value={constraint.value as string}
                    onValueChange={(value) => onUpdateConstraint(constraint.id, value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={`Select ${constraint.label.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {constraint.options.map(option => (
                        <SelectItem key={option} value={option}>
                          {option.charAt(0).toUpperCase() + option.slice(1).replace('-', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input 
                    value={constraint.value as string}
                    onChange={(e) => onUpdateConstraint(constraint.id, e.target.value)}
                    className="w-full"
                    placeholder={`Enter your ${constraint.label.toLowerCase()}`}
                  />
                )}
              </div>
              
              {constraint.examples && constraint.examples.length > 0 && (
                <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded border-l-4 border-primary/20">
                  <strong>Examples:</strong> {constraint.examples.join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
