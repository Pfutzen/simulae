
import { useMemo } from 'react';
import { SimulationFormData } from '@/utils/types';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  totalPercentage: number;
}

export const useFormValidation = (formData: SimulationFormData): ValidationResult => {
  const validation = useMemo(() => {
    const errors: string[] = [];
    
    // Calculate total percentage
    const totalPercentage = 
      formData.downPaymentPercentage +
      formData.installmentsPercentage +
      formData.reinforcementsPercentage +
      formData.keysPercentage;

    // Validate percentage sum
    if (Math.abs(totalPercentage - 100) > 0.01) {
      errors.push('A soma dos percentuais deve ser exatamente 100%');
    }

    // Validate required dates
    if (!formData.valuationDate) {
      errors.push('Data de avaliação é obrigatória');
    }

    if (!formData.deliveryDate) {
      errors.push('Data de entrega é obrigatória');
    }

    // Validate installments count
    if (formData.installmentsCount < 1) {
      errors.push('Deve haver pelo menos 1 parcela');
    }

    // Validate property value
    if (formData.propertyValue <= 0) {
      errors.push('Valor do imóvel deve ser maior que zero');
    }

    return {
      isValid: errors.length === 0,
      errors,
      totalPercentage
    };
  }, [
    formData.downPaymentPercentage,
    formData.installmentsPercentage,
    formData.reinforcementsPercentage,
    formData.keysPercentage,
    formData.valuationDate,
    formData.deliveryDate,
    formData.installmentsCount,
    formData.propertyValue
  ]);

  return validation;
};
