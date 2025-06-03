
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/utils/formatters';
import { formatDateForDisplay } from '@/utils/dateUtils';
import { PaymentType } from '@/utils/types';
import { Calendar, DollarSign, CreditCard, TrendingUp } from 'lucide-react';

interface MobileScheduleTableProps {
  schedule: PaymentType[];
}

const MobileScheduleTable: React.FC<MobileScheduleTableProps> = ({ schedule }) => {
  return (
    <div className="space-y-3">
      {schedule.map((payment, index) => (
        <Card key={index} className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span>{payment.date ? formatDateForDisplay(payment.date) : '-'}</span>
              </div>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {payment.description}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {/* Valor principal */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-sm text-slate-600">Valor</span>
              </div>
              <span className="text-sm font-semibold text-green-600">
                {formatCurrency(payment.amount)}
              </span>
            </div>

            {/* Reforço (se existir) */}
            {payment.reinforcementValue && payment.reinforcementValue > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-orange-600" />
                  <span className="text-sm text-slate-600">Reforço</span>
                </div>
                <span className="text-sm font-semibold text-orange-600">
                  {formatCurrency(payment.reinforcementValue)}
                </span>
              </div>
            )}

            {/* Grid de informações adicionais */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div>
                <p className="text-xs text-slate-500 mb-1">Saldo Devedor</p>
                <p className="text-sm font-medium text-slate-800">
                  {formatCurrency(payment.balance)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Total Pago</p>
                <p className="text-sm font-medium text-slate-800">
                  {formatCurrency(payment.totalPaid)}
                </p>
              </div>
            </div>

            {/* Valor do imóvel */}
            <div className="bg-slate-50 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Valor do Imóvel</span>
                <span className="text-sm font-semibold text-blue-600">
                  {formatCurrency(payment.propertyValue)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MobileScheduleTable;
