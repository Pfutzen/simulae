
import React from "react";
import { Input } from "@/components/ui/input";

interface CurrencyInputProps {
  id?: string;
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

const CurrencyInput: React.FC<CurrencyInputProps> = ({
  id,
  value,
  onChange,
  className = ""
}) => {
  const formatCurrency = (num: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(num).replace('R$', '').trim();
  };

  const parseCurrency = (str: string): number => {
    const cleanStr = str.replace(/[^\d,]/g, '').replace(',', '.');
    return parseFloat(cleanStr) || 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const numericValue = parseCurrency(inputValue);
    onChange(numericValue);
  };

  return (
    <Input
      id={id}
      type="text"
      value={formatCurrency(value)}
      onChange={handleChange}
      className={className}
      suffix="R$"
    />
  );
};

export default CurrencyInput;
