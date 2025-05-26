
import { PropostaData } from '@/types/proposta';
import { SavedSimulation } from './simulationHistoryUtils';
import { formatCurrency, formatDateBR } from './formatUtils';

export const generatePropostaText = (data: PropostaData, simulation: SavedSimulation): string => {
  // Calcular data de entrega das chaves
  const getKeysDeliveryDate = () => {
    if (simulation.formData.startDate) {
      const keysDate = new Date(simulation.formData.startDate);
      keysDate.setMonth(keysDate.getMonth() + simulation.formData.installmentsCount + 1);
      return formatDateBR(keysDate);
    }
    return `${simulation.formData.installmentsCount + 1} meses após o início`;
  };

  const reinforcements = simulation.schedule?.filter(payment => 
    payment.description.includes("Reforço")
  ) || [];

  let text = "";

  // Título
  text += "PROPOSTA COMERCIAL\n";
  text += "==================\n\n";
  text += `Simulação: ${simulation.name}\n\n`;

  // Dados do Comprador
  text += "DADOS DO COMPRADOR\n";
  text += "------------------\n";
  text += `Nome: ${data.nomeCompleto || "___________________"}\n`;
  text += `CPF: ${data.cpf || "___.___.___-__"}\n`;
  text += `Telefone: ${data.telefone || "(__) _____-____"}\n`;
  text += `E-mail: ${data.email || "_________________"}\n\n`;

  // Dados da Unidade
  text += "DADOS DA UNIDADE\n";
  text += "----------------\n";
  text += `Empreendimento: ${data.nomeEmpreendimento || "___________________"}\n`;
  text += `Endereço: ${data.enderecoCompleto || "___________________"}\n`;
  text += `Unidade: ${data.numeroUnidade || "___"} - ${data.andarPavimento || "___º andar"}\n`;
  text += `Área privativa: ${data.areaPrivativa || "___"} m²\n`;
  text += `Vagas: ${data.numeroVagas || "___"} ${data.possuiBox ? "com box" : "sem box"}\n\n`;

  // Proposta Financeira
  text += "PROPOSTA FINANCEIRA\n";
  text += "-------------------\n";
  text += `Valor total do imóvel: ${formatCurrency(simulation.formData.propertyValue)}\n\n`;

  text += `Entrada: ${formatCurrency(simulation.formData.downPaymentValue)}\n`;
  if (simulation.formData.startDate) {
    text += `Data: ${formatDateBR(new Date(simulation.formData.startDate))}\n`;
  }
  text += "\n";

  text += `Parcelas mensais:\n`;
  text += `${simulation.formData.installmentsCount}x de ${formatCurrency(simulation.formData.installmentsValue)}\n`;
  
  if (simulation.formData.startDate) {
    const startDate = new Date(simulation.formData.startDate);
    const firstInstallment = new Date(startDate.setMonth(startDate.getMonth() + 1));
    const lastInstallment = new Date(startDate.setMonth(startDate.getMonth() + simulation.formData.installmentsCount - 1));
    text += `Período: ${formatDateBR(firstInstallment)} até ${formatDateBR(lastInstallment)}\n`;
  }
  text += "\n";

  // Reforços (se houver)
  if (reinforcements.length > 0) {
    text += `Reforços:\n`;
    reinforcements.forEach(reinforcement => {
      text += `Mês ${reinforcement.month}: ${formatCurrency(reinforcement.amount)}\n`;
    });
    text += "\n";
  }

  text += `Saldo na entrega das chaves: ${formatCurrency(simulation.formData.keysValue)}\n`;
  text += `Data prevista: ${getKeysDeliveryDate()}\n\n`;

  // Correção Monetária
  text += "CORREÇÃO MONETÁRIA\n";
  text += "------------------\n";
  text += "Os valores apresentados acima são nominais. Toda a composição será corrigida mensalmente pelo índice CUB/SC acumulado (média dos últimos 12 meses) até a data de vencimento de cada parcela, conforme política vigente da construtora.\n";

  return text;
};

export const copyPropostaToClipboard = async (data: PropostaData, simulation: SavedSimulation): Promise<void> => {
  const text = generatePropostaText(data, simulation);
  await navigator.clipboard.writeText(text);
};
