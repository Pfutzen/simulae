
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle } from "lucide-react";

interface FormValidationProps {
  totalPercentage: number;
}

const FormValidation: React.FC<FormValidationProps> = ({ totalPercentage }) => {
  return (
    <Alert className={totalPercentage === 100 ? "bg-green-50" : "bg-amber-50"}>
      <div className="flex items-center gap-2">
        {totalPercentage === 100 ? (
          <CheckCircle className="h-5 w-5 text-green-600" />
        ) : (
          <AlertCircle className="h-5 w-5 text-amber-600" />
        )}
        <AlertDescription className={totalPercentage === 100 ? "text-green-800" : "text-amber-800"}>
          Total atual: {totalPercentage.toFixed(2)}%
          {totalPercentage !== 100 && " (deve totalizar exatamente 100%)"}
        </AlertDescription>
      </div>
    </Alert>
  );
};

export default FormValidation;
