
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PercentageValidationIndicatorProps {
  totalPercentage: number;
  className?: string;
}

const PercentageValidationIndicator: React.FC<PercentageValidationIndicatorProps> = ({
  totalPercentage,
  className
}) => {
  const isValid = totalPercentage === 100;
  const difference = totalPercentage - 100;
  
  const getDifferenceText = (): string => {
    if (difference === 0) return "";
    
    const formattedDifference = Math.abs(difference).toFixed(2);
    return difference > 0 
      ? `(${formattedDifference}% acima)` 
      : `(${formattedDifference}% abaixo)`;
  };

  return (
    <Alert 
      className={cn(
        "border-2",
        isValid 
          ? "border-green-500 bg-green-50" 
          : "border-red-500 bg-red-50",
        className
      )}
    >
      <div className="flex items-center gap-2">
        {isValid ? (
          <CheckCircle className="h-5 w-5 text-green-600" />
        ) : (
          <AlertCircle className="h-5 w-5 text-red-600" />
        )}
        <AlertDescription className={cn(
          "font-medium",
          isValid ? "text-green-800" : "text-red-800"
        )}>
          {isValid ? "✅" : "❌"} Total atual: {totalPercentage.toFixed(2)}% {getDifferenceText()}
          {!isValid && (
            <span className="block mt-1 text-sm">
              A soma dos percentuais deve ser exatamente 100%
            </span>
          )}
        </AlertDescription>
      </div>
    </Alert>
  );
};

export default PercentageValidationIndicator;
