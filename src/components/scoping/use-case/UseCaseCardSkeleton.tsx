
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const UseCaseCardSkeleton = () => {
  return (
    <Card className="border border-border">
      <CardContent className="p-4">
        <Skeleton className="h-6 w-2/3 mb-3" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6" />
        <div className="flex mt-3 gap-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-24" />
        </div>
      </CardContent>
    </Card>
  );
};
