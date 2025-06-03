
import React from 'react';
import { formatCurrency } from '@/utils/formatters';
import { formatDateForDisplay } from '@/utils/dateUtils';
import { PaymentType } from '@/utils/types';

interface MobileScheduleTableProps {
  schedule: PaymentType[];
}

const MobileScheduleTable: React.FC<MobileScheduleTableProps> = ({ schedule }) => {
  return (
    <div className="space-y-2">
      {schedule.map((payment, index) => {
        // Determinar o tipo de parcela
        let parcelaLabel = '';
        if (payment.description.includes('Entrada')) {
          parcelaLabel = 'Entrada';
        } else if (payment.description.includes('Chaves')) {
          parcelaLabel = 'Chaves';
        } else {
          const parcelaNumber = index; // Ajustar conforme necessário
          const hasReinforcement = payment.reinforcementValue && payment.reinforcementValue > 0;
          parcelaLabel = hasReinforcement ? `Parcela ${parcelaNumber} + R${Math.ceil(index / 6)}` : `Parcela ${parcelaNumber}`;
        }

        // Verificar se o reforço é alto (acima de R$ 99.999,99)
        const reinforcementValue = payment.reinforcementValue || 0;
        const isHighReinforcement = reinforcementValue > 99999.99;

        return (
          <div key={index} className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
            {/* Primeira linha: Data + Parcela + Valor */}
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium text-slate-700">
                  {payment.date ? formatDateForDisplay(payment.date) : '-'}
                </span>
                <span className="text-slate-600">{parcelaLabel}</span>
              </div>
              <span className="font-semibold text-green-600 text-sm">
                {formatCurrency(payment.amount)}
              </span>
            </div>

            {/* Segunda linha: Reforço | Saldo | Imóvel - com quebra inteligente */}
            <div className="text-xs text-slate-600">
              {isHighReinforcement ? (
                // Layout com quebra de linha para valores altos de reforço
                <>
                  <div className="mb-1">
                    <span>
                      Reforço: <span className="font-medium text-orange-600">
                        {formatCurrency(reinforcementValue)}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>
                      Saldo: <span className="font-medium text-slate-700">
                        {formatCurrency(payment.balance)}
                      </span>
                    </span>
                    <span className="text-slate-300 mx-2">|</span>
                    <span>
                      Imóvel: <span className="font-medium text-blue-600">
                        {formatCurrency(payment.propertyValue)}
                      </span>
                    </span>
                  </div>
                </>
              ) : (
                // Layout original para valores normais
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span>
                      Reforço: <span className="font-medium text-orange-600">
                        {formatCurrency(reinforcementValue)}
                      </span>
                    </span>
                    <span className="text-slate-300">|</span>
                    <span>
                      Saldo: <span className="font-medium text-slate-700">
                        {formatCurrency(payment.balance)}
                      </span>
                    </span>
                  </div>
                  <span>
                    Imóvel: <span className="font-medium text-blue-600">
                      {formatCurrency(payment.propertyValue)}
                    </span>
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MobileScheduleTable;
