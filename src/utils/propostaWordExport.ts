
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';
import { PropostaData } from '@/types/proposta';
import { SavedSimulation } from './simulationHistoryUtils';
import { formatCurrency, formatDateBR } from './formatUtils';

export const generatePropostaWord = async (data: PropostaData, simulation: SavedSimulation): Promise<void> => {
  // Calcular data de entrega das chaves
  const getKeysDeliveryDate = () => {
    if (simulation.formData.startDate) {
      const keysDate = new Date(simulation.formData.startDate);
      keysDate.setMonth(keysDate.getMonth() + simulation.formData.installmentsCount + 1);
      return formatDateBR(keysDate);
    }
    return `${simulation.formData.installmentsCount + 1} meses após o início`;
  };

  // Gerar descrição da correção monetária baseada no modo
  const getCorrectionDescription = () => {
    if (simulation.formData.correctionMode === "cub") {
      return "Os valores apresentados acima são nominais. Toda a composição será corrigida mensalmente pelo índice CUB/SC acumulado (média dos últimos 12 meses) até a data de vencimento de cada parcela, conforme política vigente da construtora.";
    } else {
      const percentage = (simulation.formData.correctionIndex * 100).toFixed(2);
      return `Os valores apresentados acima são nominais. Toda a composição será corrigida mensalmente pelo índice de ${percentage}% ao mês até a data de vencimento de cada parcela, conforme política vigente da construtora.`;
    }
  };

  const reinforcements = simulation.schedule?.filter(payment => 
    payment.description.includes("Reforço")
  ) || [];

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        // Título
        new Paragraph({
          text: "PROPOSTA COMERCIAL",
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 }
        }),

        // Subtítulo
        new Paragraph({
          children: [
            new TextRun({
              text: `Simulação: ${simulation.name}`,
              italics: true
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 600 }
        }),

        // DADOS DO COMPRADOR
        new Paragraph({
          text: "DADOS DO COMPRADOR",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 }
        }),

        new Paragraph({
          children: [
            new TextRun({ text: "Nome: ", bold: true }),
            new TextRun({ text: data.nomeCompleto || "___________________" })
          ],
          spacing: { after: 100 }
        }),

        new Paragraph({
          children: [
            new TextRun({ text: "CPF: ", bold: true }),
            new TextRun({ text: data.cpf || "___.___.___-__" })
          ],
          spacing: { after: 100 }
        }),

        new Paragraph({
          children: [
            new TextRun({ text: "Telefone: ", bold: true }),
            new TextRun({ text: data.telefone || "(__) _____-____" })
          ],
          spacing: { after: 100 }
        }),

        new Paragraph({
          children: [
            new TextRun({ text: "E-mail: ", bold: true }),
            new TextRun({ text: data.email || "_________________" })
          ],
          spacing: { after: 300 }
        }),

        // DADOS DA UNIDADE
        new Paragraph({
          text: "DADOS DA UNIDADE",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 }
        }),

        new Paragraph({
          children: [
            new TextRun({ text: "Empreendimento: ", bold: true }),
            new TextRun({ text: data.nomeEmpreendimento || "___________________" })
          ],
          spacing: { after: 100 }
        }),

        new Paragraph({
          children: [
            new TextRun({ text: "Endereço: ", bold: true }),
            new TextRun({ text: data.enderecoCompleto || "___________________" })
          ],
          spacing: { after: 100 }
        }),

        new Paragraph({
          children: [
            new TextRun({ text: "Unidade: ", bold: true }),
            new TextRun({ text: `${data.numeroUnidade || "___"} - ${data.andarPavimento || "___º andar"}` })
          ],
          spacing: { after: 100 }
        }),

        new Paragraph({
          children: [
            new TextRun({ text: "Área privativa: ", bold: true }),
            new TextRun({ text: `${data.areaPrivativa || "___"} m²` })
          ],
          spacing: { after: 100 }
        }),

        new Paragraph({
          children: [
            new TextRun({ text: "Vagas: ", bold: true }),
            new TextRun({ text: `${data.numeroVagas || "___"} ${data.possuiBox ? "com box" : "sem box"}` })
          ],
          spacing: { after: 300 }
        }),

        // PROPOSTA FINANCEIRA
        new Paragraph({
          text: "PROPOSTA FINANCEIRA",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 }
        }),

        new Paragraph({
          children: [
            new TextRun({ 
              text: `Valor total do imóvel: ${formatCurrency(simulation.formData.propertyValue)}`, 
              bold: true,
              size: 24
            })
          ],
          spacing: { after: 200 }
        }),

        new Paragraph({
          children: [
            new TextRun({ text: "Entrada: ", bold: true }),
            new TextRun({ text: formatCurrency(simulation.formData.downPaymentValue) })
          ],
          spacing: { after: 100 }
        }),

        ...(simulation.formData.startDate ? [
          new Paragraph({
            children: [
              new TextRun({ text: "Data: ", italics: true }),
              new TextRun({ text: formatDateBR(new Date(simulation.formData.startDate)), italics: true })
            ],
            spacing: { after: 100 }
          })
        ] : []),

        new Paragraph({
          children: [
            new TextRun({ text: "Parcelas mensais: ", bold: true })
          ],
          spacing: { after: 100 }
        }),

        new Paragraph({
          children: [
            new TextRun({ text: `${simulation.formData.installmentsCount}x de ${formatCurrency(simulation.formData.installmentsValue)}` })
          ],
          spacing: { after: 100 }
        }),

        // Reforços (se houver)
        ...(reinforcements.length > 0 ? [
          new Paragraph({
            children: [
              new TextRun({ text: "Reforços: ", bold: true })
            ],
            spacing: { after: 100 }
          }),
          ...reinforcements.map(reinforcement => 
            new Paragraph({
              children: [
                new TextRun({ text: `Mês ${reinforcement.month}: ${formatCurrency(reinforcement.amount)}` })
              ],
              spacing: { after: 50 }
            })
          )
        ] : []),

        new Paragraph({
          children: [
            new TextRun({ text: "Saldo na entrega das chaves: ", bold: true }),
            new TextRun({ text: formatCurrency(simulation.formData.keysValue) })
          ],
          spacing: { after: 100 }
        }),

        new Paragraph({
          children: [
            new TextRun({ text: "Data prevista: ", italics: true }),
            new TextRun({ text: getKeysDeliveryDate(), italics: true })
          ],
          spacing: { after: 300 }
        }),

        // CORREÇÃO MONETÁRIA
        new Paragraph({
          text: "CORREÇÃO MONETÁRIA",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 }
        }),

        new Paragraph({
          children: [
            new TextRun({
              text: getCorrectionDescription(),
              size: 20
            })
          ],
          spacing: { after: 200 }
        })
      ]
    }]
  });

  // Gerar e salvar o documento
  const blob = await Packer.toBlob(doc);
  saveAs(blob, `proposta_comercial_${simulation.name.replace(/\s+/g, '_')}.docx`);
};
