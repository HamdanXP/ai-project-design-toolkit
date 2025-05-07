
import { ReactNode } from "react";
import { CardTitle } from "@/components/ui/card";

type StepHeadingProps = {
  stepNumber: number;
  title: string;
  children?: ReactNode;
};

export const StepHeading = ({ stepNumber, title, children }: StepHeadingProps) => {
  return (
    <>
      <CardTitle className="flex items-center text-xl font-semibold">
        <span className="bg-primary text-primary-foreground rounded-full h-7 w-7 flex items-center justify-center mr-2 text-sm">
          {stepNumber}
        </span>
        {title}
      </CardTitle>
      {children}
    </>
  );
};
