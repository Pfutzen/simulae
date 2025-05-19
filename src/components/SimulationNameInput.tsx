
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SimulationNameInputProps {
  value: string;
  onChange: (value: string) => void;
}

const SimulationNameInput: React.FC<SimulationNameInputProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="simulation-name" className="text-sm font-medium">
        Nome da Simulação
      </Label>
      <Input
        id="simulation-name"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ex: Cliente João - Apto 802"
        className="w-full"
      />
    </div>
  );
};

export default SimulationNameInput;
