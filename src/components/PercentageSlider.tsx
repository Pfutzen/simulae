
import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatToBrazilianNumber, parseBrazilianNumber, formatNumberWithCursor } from "@/utils/formatUtils";
import { SlidersHorizontal, Plus, Minus, ExternalLink, Info } from "lucide-react";

interface PercentageSliderProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  showIncrementButtons?: boolean;
  incrementStep?: number;
  showInfoLink?: boolean;
  infoLinkUrl?: string;
  infoLinkTooltip?: string;
  useFipeLogo?: boolean;
}

const PercentageSlider: React.FC<PercentageSliderProps> = ({
  id,
  label,
  value,
  onChange,
  min = 0,
  max = 5,
  step = 0.01,
  suffix = "%",
  showIncrementButtons = false,
  incrementStep = 0.05,
  showInfoLink = false,
  infoLinkUrl,
  infoLinkTooltip = "Consultar referência externa",
  useFipeLogo = false
}) => {
  const [internalValue, setInternalValue] = useState<string>("");
  const [cursorPosition, setCursorPosition] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Update internal value when external value changes
  useEffect(() => {
    setInternalValue(formatToBrazilianNumber(value));
  }, [value]);
  
  // Update cursor position after value change
  useEffect(() => {
    if (inputRef.current && document.activeElement === inputRef.current) {
      inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
    }
  }, [internalValue, cursorPosition]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const currentPosition = e.target.selectionStart || 0;
    const wasSelection = e.target.selectionStart !== e.target.selectionEnd;
    
    // Get the newly typed character (if applicable)
    const newChar = newValue.length > internalValue.length ? 
      newValue.charAt(currentPosition - 1) : null;
    
    // Use our formatter that preserves cursor position
    const result = formatNumberWithCursor(
      newValue,
      currentPosition,
      newChar,
      wasSelection
    );
    
    setInternalValue(result.formattedValue);
    setCursorPosition(result.cursorPosition);
    onChange(result.numericValue);
  };
  
  const handleSliderChange = (newValue: number[]) => {
    const value = newValue[0];
    setInternalValue(formatToBrazilianNumber(value));
    onChange(value);
  };
  
  const handleIncrement = () => {
    const newValue = Math.min(max, value + incrementStep);
    setInternalValue(formatToBrazilianNumber(newValue));
    onChange(newValue);
  };
  
  const handleDecrement = () => {
    const newValue = Math.max(min, value - incrementStep);
    setInternalValue(formatToBrazilianNumber(newValue));
    onChange(newValue);
  };
  
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Position cursor at beginning of number rather than after decimal
    if (e.target.value.includes(',')) {
      const commaPosition = e.target.value.indexOf(',');
      setTimeout(() => {
        e.target.setSelectionRange(0, 0);
      }, 0);
    } else {
      e.target.select();
    }
  };

  const handleInfoLinkClick = () => {
    if (infoLinkUrl) {
      window.open(infoLinkUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Label htmlFor={id} className="text-base font-medium">
          {label}
        </Label>
        {showInfoLink && infoLinkUrl && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleInfoLinkClick}
                  className="h-6 w-6 p-0 text-slate-500 hover:text-blue-600"
                >
                  {useFipeLogo ? (
                    <img 
                      src="/lovable-uploads/d4c08568-a5a1-4241-aa13-1502fe7b51df.png" 
                      alt="Fipe Logo" 
                      className="h-4 w-auto object-contain"
                    />
                  ) : (
                    <Info className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{infoLinkTooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {showIncrementButtons && (
        <div className="flex items-center justify-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDecrement}
            disabled={value <= min}
            className="h-8 w-8 p-0"
          >
            <Minus className="h-3 w-3" />
          </Button>
          <Input
            id={id}
            ref={inputRef}
            type="text"
            value={internalValue}
            onChange={handleInputChange}
            onFocus={handleFocus}
            className="w-24 text-center font-medium"
            suffix={suffix}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleIncrement}
            disabled={value >= max}
            className="h-8 w-8 p-0"
          >
            <Plus className="h-3 w-3" />
          </Button>
          <div className="flex items-center">
            <SlidersHorizontal className="h-4 w-4 text-slate-400" />
          </div>
        </div>
      )}

      {!showIncrementButtons && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-slate-400" />
            <Input
              id={id}
              ref={inputRef}
              type="text"
              value={internalValue}
              onChange={handleInputChange}
              onFocus={handleFocus}
              className="w-24 text-right font-medium"
              suffix={suffix}
            />
          </div>
        </div>
      )}
      
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
