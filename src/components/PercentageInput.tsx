
import React from "react";
import { Input } from "@/components/ui/input";

interface PercentageInputProps {
  id?: string;
  value: number;
  onChange: (value: number) => void;
  noDecimals?: boolean;
  className?: string;
}

const PercentageInput: React.FC<PercentageInputProps> = ({
  id,
  value,
  onChange,
  noDecimals = false,
  className = ""
}) => {
  const formatPercentage = (num: number): string => {
    if (noDecimals) {
      return Math.round(num).toString();
    }
    return num.toFixed(2).replace('.', ',');
  };

  const parsePercentage = (str: string): number => {
    const cleanStr = str.replace(',', '.');
    return parseFloat(cleanStr) || 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const numericValue = parsePercentage(inputValue);
    onChange(numericValue);
  };

  return (
    <Input
      id={id}
      type="text"
      value={formatPercentage(value)}
      onChange={handleChange}
      className={className}
      suffix="%"
    />
  );
};

export default PercentageInput;
