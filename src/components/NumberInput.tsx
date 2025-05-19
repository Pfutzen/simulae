import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatToBrazilianNumber, parseBrazilianNumber } from "@/utils/formatUtils";
interface NumberInputProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  disabled?: boolean;
}
const NumberInput: React.FC<NumberInputProps> = ({
  id,
  label,
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  suffix = "",
  disabled = false
}) => {
  const [internalValue, setInternalValue] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    // Format the value when it changes externally
    setInternalValue(formatToBrazilianNumber(value));
  }, [value]);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    // Remove non-numeric characters for processing but keep the formatted display
    const cleanValue = newValue.replace(/[^\d.,]/g, '');
    if (cleanValue === '' || cleanValue === ',' || cleanValue === '.') {
      setInternalValue('');
      onChange(0);
      return;
    }

    // Update the internal state with formatted value
    setInternalValue(newValue);

    // Parse the value and pass it to parent component
    const numericValue = parseBrazilianNumber(newValue);
    onChange(numericValue);
  };
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Select all text on focus for better UX
    e.target.select();
  };
  return <div className="space-y-2">
      <Label htmlFor={id} className="text-base font-medium">
        {label}
      </Label>
      <Input id={id} ref={inputRef} type="text" value={internalValue} onChange={handleChange} onFocus={handleFocus} disabled={disabled} suffix={suffix} className="" />
    </div>;
};
export default NumberInput;