
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileScheduleTable from './MobileScheduleTable';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/utils/formatters';
import { formatDateForDisplay } from '@/utils/dateUtils';
import { PaymentType } from '@/utils/types';

interface ResponsiveScheduleTableProps {
  schedule: PaymentType[];
}

const ResponsiveScheduleTable: React.FC<ResponsiveScheduleTableProps> = ({ schedule }) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileScheduleTable schedule={schedule} />;
  }

  // Desktop table view
  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[12%]">Data</TableHead>
            <TableHead className="w-[15%]">Tipo</TableHead>
            <TableHead className="w-[13%]">Valor</TableHead>
            <TableHead className="w-[13%]">Reforço</TableHead>
            <TableHead className="w-[13%]">Saldo</TableHead>
            <TableHead className="w-[13%]">Total Pago</TableHead>
            <TableHead className="w-[21%]">Valor do Imóvel</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schedule.map((payment, index) => (
            <TableRow key={index}>
              <TableCell>
                <div className="truncate">
                  {payment.date ? formatDateForDisplay(payment.date) : "-"}
                </div>
              </TableCell>
              <TableCell>
                <div className="truncate" title={payment.description}>
                  {payment.description}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="truncate">
                  {formatCurrency(payment.amount)}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="truncate">
                  {formatCurrency(payment.reinforcementValue || 0)}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="truncate">
                  {formatCurrency(payment.balance)}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="truncate">
                  {formatCurrency(payment.totalPaid)}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="truncate">
                  {formatCurrency(payment.propertyValue)}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ResponsiveScheduleTable;
