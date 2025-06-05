
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, AlertTriangle, Info } from "lucide-react";
import { SuitabilityHelpContent } from "@/types/scoping-phase";

type SuitabilityHelpPanelProps = {
  helpContent: SuitabilityHelpContent;
};

export const SuitabilityHelpPanel = ({ helpContent }: SuitabilityHelpPanelProps) => {
  return (
    <Card className="mb-4 bg-blue-50 border-blue-200">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <div className="flex items-center mb-2">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
              <span className="font-medium text-green-800">What to Look For</span>
            </div>
            <ul className="space-y-1">
              {helpContent.lookFor.map((item, index) => (
                <li key={index} className="text-sm text-green-700 flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="flex items-center mb-2">
              <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
              <span className="font-medium text-red-800">Warning Signs</span>
            </div>
            <ul className="space-y-1">
              {helpContent.warningsSigns.map((item, index) => (
                <li key={index} className="text-sm text-red-700 flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-3 border-t border-blue-200">
          <div className="flex items-start">
            <Info className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium text-blue-800 block mb-1">Why This Matters</span>
              <p className="text-sm text-blue-700">{helpContent.whyMatters}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
