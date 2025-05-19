
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
  const [valueCursorPosition, setValueCursorPosition] = useState<number | null>(null);
  const [percentageCursorPosition, setPercentageCursorPosition] = useState<number | null>(null);
  const [isValueTextSelected, setIsValueTextSelected] = useState(false);
  const [isPercentageTextSelected, setIsPercentageTextSelected] = useState(false);
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

  useEffect(() => {
    // Set cursor position after the component updates
    if (valueInputRef.current && valueCursorPosition !== null) {
      valueInputRef.current.setSelectionRange(valueCursorPosition, valueCursorPosition);
    }
  }, [internalValue, valueCursorPosition]);

  useEffect(() => {
    // Set cursor position after the component updates
    if (percentageInputRef.current && percentageCursorPosition !== null) {
      percentageInputRef.current.setSelectionRange(percentageCursorPosition, percentageCursorPosition);
    }
  }, [internalPercentage, percentageCursorPosition]);

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const selectionStart = e.target.selectionStart || 0;
    
    // Determine if we're adding or removing characters
    const isAdding = newValue.length > internalValue.length;
    const newChar = isAdding ? newValue.charAt(selectionStart - 1) : null;
    
    // Format the number with appropriate cursor position
    const { formattedValue, cursorPosition: newCursorPosition } = formatNumberWithCursor(
      newValue,
      selectionStart,
      newChar,
      isValueTextSelected
    );
    
    setInternalValue(formattedValue);
    setValueCursorPosition(newCursorPosition);
    setIsValueTextSelected(false);
    
    const numericValue = parseBrazilianNumber(formattedValue);
    onValueChange(numericValue);
  };

  const handlePercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPercentage = e.target.value;
    const selectionStart = e.target.selectionStart || 0;
    
    if (noDecimalsForPercentage) {
      // Remove non-numeric characters
      const cleanValue = newPercentage.replace(/\D/g, '');
      
      // Handle case where all text was selected and user started typing
      let numericValue;
      let newCursorPos = 1;
      
      if (isPercentageTextSelected && cleanValue.length === 1) {
        numericValue = parseInt(cleanValue) || 0;
      } else {
        // Parse as integer
        numericValue = parseInt(cleanValue) || 0;
        
        // If not selecting all text, calculate cursor position normally
        if (!isPercentageTextSelected) {
          // Calculate new cursor position (accounting for thousand separators)
          const formattedValue = numericValue.toLocaleString('pt-BR');
          const newThousandSepCount = (formattedValue.match(/\./g) || []).length;
          const oldThousandSepCount = (newPercentage.match(/\./g) || []).length;
          const thousandSepDiff = newThousandSepCount - oldThousandSepCount;
          newCursorPos = selectionStart + thousandSepDiff;
        }
      }
      
      // Format with thousand separators but without decimals
      const formattedValue = numericValue.toLocaleString('pt-BR');
      
      setInternalPercentage(formattedValue);
      setPercentageCursorPosition(newCursorPos);
      setIsPercentageTextSelected(false);
      onPercentageChange(numericValue);
    } else {
      // Use existing formatting logic for decimal numbers
      // Determine if we're adding or removing characters
      const isAdding = newPercentage.length > internalPercentage.length;
      const newChar = isAdding ? newPercentage.charAt(selectionStart - 1) : null;
      
      // Format the number with appropriate cursor position
      const { formattedValue, cursorPosition: newCursorPosition } = formatNumberWithCursor(
        newPercentage,
        selectionStart,
        newChar,
        isPercentageTextSelected
      );
      
      setInternalPercentage(formattedValue);
      setPercentageCursorPosition(newCursorPosition);
      setIsPercentageTextSelected(false);
      
      const numericPercentage = parseBrazilianNumber(formattedValue);
      onPercentageChange(numericPercentage);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Select all text on focus for better UX
    e.target.select();
    const inputId = e.target.id;
    if (inputId.includes('value')) {
      setIsValueTextSelected(true);
    } else if (inputId.includes('percentage')) {
      setIsPercentageTextSelected(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow only numbers, backspace, delete, arrow keys, tab
    const allowedKeys = [
      'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End',
      '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
    ];
    
    if (!allowedKeys.includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleValueSelect = () => setIsValueTextSelected(true);
  const handlePercentageSelect = () => setIsPercentageTextSelected(true);
  
  const handleValueBlur = () => setIsValueTextSelected(false);
  const handlePercentageBlur = () => setIsPercentageTextSelected(false);

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
            onKeyDown={handleKeyDown}
            onSelect={handleValueSelect}
            onBlur={handleValueBlur}
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
            onKeyDown={handleKeyDown}
            onSelect={handlePercentageSelect}
            onBlur={handlePercentageBlur}
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
