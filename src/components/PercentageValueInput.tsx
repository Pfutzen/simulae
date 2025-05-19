
import React, { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatToBrazilianNumber, parseBrazilianNumber, formatNumberWithCursor } from "@/utils/formatUtils";

interface PercentageValueInputProps {
  label: string;
  valueLabel?: string;
  percentageLabel?: string;
  value: number;
  percentage: number;
  totalValue: number;
  onValueChange: (value: number) => void;
  onPercentageChange: (percentage: number) => void;
  disabled?: boolean;
  noDecimalsForPercentage?: boolean;
}

const PercentageValueInput: React.FC<PercentageValueInputProps> = ({
  label,
  valueLabel = "Valor (R$)",
  percentageLabel = "Percentual (%)",
  value,
  percentage,
  totalValue,
  onValueChange,
  onPercentageChange,
  disabled = false,
  noDecimalsForPercentage = false,
}) => {
  const [internalValue, setInternalValue] = useState<string>("");
  const [internalPercentage, setInternalPercentage] = useState<string>("");
  const [valueCursorPosition, setValueCursorPosition] = useState<number>(0);
  const [percentageCursorPosition, setPercentageCursorPosition] = useState<number>(0);
  const valueInputRef = useRef<HTMLInputElement>(null);
  const percentageInputRef = useRef<HTMLInputElement>(null);

  // Update internal state when props change
  useEffect(() => {
    setInternalValue(formatToBrazilianNumber(value));
  }, [value]);

  useEffect(() => {
    if (noDecimalsForPercentage) {
      setInternalPercentage(Math.round(percentage).toLocaleString('pt-BR'));
    } else {
      setInternalPercentage(formatToBrazilianNumber(percentage));
    }
  }, [percentage, noDecimalsForPercentage]);

  // Update cursor position after value change
  useEffect(() => {
    if (valueInputRef.current && document.activeElement === valueInputRef.current) {
      valueInputRef.current.setSelectionRange(valueCursorPosition, valueCursorPosition);
    }
  }, [internalValue, valueCursorPosition]);

  useEffect(() => {
    if (percentageInputRef.current && document.activeElement === percentageInputRef.current) {
      percentageInputRef.current.setSelectionRange(percentageCursorPosition, percentageCursorPosition);
    }
  }, [internalPercentage, percentageCursorPosition]);

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    setValueCursorPosition(result.cursorPosition);
    onValueChange(result.numericValue);
  };

  const handlePercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPercentage = e.target.value;
    const currentPosition = e.target.selectionStart || 0;
    const wasSelection = e.target.selectionStart !== e.target.selectionEnd;
    
    if (noDecimalsForPercentage) {
      // Remove non-numeric characters
      const cleanValue = newPercentage.replace(/\D/g, '');
      
      // If it's empty, return a default
      if (!cleanValue) {
        setInternalPercentage('0');
        setPercentageCursorPosition(1);
        onPercentageChange(0);
        return;
      }

      // Parse as integer
      const numericValue = parseInt(cleanValue) || 0;
      
      // Format with thousand separators but without decimals
      const formattedValue = numericValue.toLocaleString('pt-BR');
      
      // Calculate new cursor position
      let newPosition = currentPosition;
      if (!wasSelection) {
        // Adjust for thousand separators that might have been added
        const oldThousandSepCount = (internalPercentage.match(/\./g) || []).length;
        const newThousandSepCount = (formattedValue.match(/\./g) || []).length;
        const diff = newThousandSepCount - oldThousandSepCount;
        newPosition = currentPosition + diff;
      } else {
        // If there was a selection, position at end of new content
        newPosition = formattedValue.length;
      }
      
      setInternalPercentage(formattedValue);
      setPercentageCursorPosition(newPosition);
      onPercentageChange(numericValue);
    } else {
      // Use existing formatting logic for decimal numbers
      const newChar = newPercentage.length > internalPercentage.length ? 
        newPercentage.charAt(currentPosition - 1) : null;
      
      // Format the number with appropriate cursor position
      const result = formatNumberWithCursor(
        newPercentage,
        currentPosition,
        newChar,
        wasSelection
      );
      
      setInternalPercentage(result.formattedValue);
      setPercentageCursorPosition(result.cursorPosition);
      onPercentageChange(result.numericValue);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Select all text on focus for better UX
    e.target.select();
  };

  return (
    <div className="space-y-2">
      <Label className="text-base font-medium">{label}</Label>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor={`${label}-value`} className="text-sm text-muted-foreground">
            {valueLabel}
          </Label>
          <Input
            id={`${label}-value`}
            ref={valueInputRef}
            type="text"
            value={internalValue}
            onChange={handleValueChange}
            onFocus={handleFocus}
            className="text-right"
            disabled={disabled}
            suffix="R$"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`${label}-percentage`} className="text-sm text-muted-foreground">
            {percentageLabel}
          </Label>
          <Input
            id={`${label}-percentage`}
            ref={percentageInputRef}
            type="text"
            value={internalPercentage}
            onChange={handlePercentageChange}
            onFocus={handleFocus}
            className="text-right"
            disabled={disabled}
            suffix="%"
          />
        </div>
      </div>
    </div>
  );
};

export default PercentageValueInput;
