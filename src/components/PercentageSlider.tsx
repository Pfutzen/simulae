
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { formatToBrazilianNumber, parseBrazilianNumber } from "@/utils/formatUtils";
import { SlidersHorizontal } from "lucide-react";

interface PercentageSliderProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}

const PercentageSlider: React.FC<PercentageSliderProps> = ({
  id,
  label,
  value,
  onChange,
  min = 0,
  max = 5,
  step = 0.01,
  suffix = "%"
}) => {
  const [internalValue, setInternalValue] = useState<string>("");
  
  // Update internal value when external value changes
  useEffect(() => {
    setInternalValue(formatToBrazilianNumber(value));
  }, [value]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    
    const numericValue = parseBrazilianNumber(newValue);
    if (!isNaN(numericValue)) {
      onChange(numericValue);
    }
  };
  
  const handleSliderChange = (newValue: number[]) => {
    const value = newValue[0];
    setInternalValue(formatToBrazilianNumber(value));
    onChange(value);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-base font-medium">
          {label}
        </Label>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-slate-400" />
          <Input
            id={id}
            type="text"
            value={internalValue}
            onChange={handleInputChange}
            className="w-24 text-right font-medium"
            suffix={suffix}
          />
        </div>
      </div>
      
      <Slider
        defaultValue={[value]}
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={handleSliderChange}
        className="cursor-pointer"
      />
      
      <div className="flex justify-between text-xs text-slate-500">
        <span>{formatToBrazilianNumber(min)}{suffix}</span>
        <span>{formatToBrazilianNumber(max/2)}{suffix}</span>
        <span>{formatToBrazilianNumber(max)}{suffix}</span>
      </div>
    </div>
  );
};

export default PercentageSlider;
