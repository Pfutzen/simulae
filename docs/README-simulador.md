
# Documentação do Simulador Financeiro

## Visão Geral

O simulador financeiro é uma aplicação React que permite calcular cronogramas de pagamento para imóveis, considerando correção monetária, valorização e análise de rentabilidade.

## Fluxos de Simulação

### 1. Fluxo Pré-Chaves
- **Entrada**: Pagamento inicial no momento da avaliação
- **Parcelas mensais**: Pagamentos regulares com possíveis reforços
- **Correção monetária**: Aplicada ao saldo devedor
- **Chaves**: Pagamento do saldo restante na entrega

### 2. Fluxo Pós-Chaves
- **Análise de revenda**: Cálculo de lucro em diferentes momentos
- **Estimativa de aluguel**: Projeção de renda mensal
- **ROI**: Retorno sobre investimento

## Estrutura de Arquivos

### `/src/hooks/`
- `useSimulationFlow.ts`: Hook principal para execução de simulações
- `useFormValidation.ts`: Validação de formulários

### `/src/lib/financial/`
- `percentageCalculations.ts`: Cálculos de percentuais e valores
- `correctionCalculations.ts`: Correção monetária (manual/CUB)
- `scheduleCalculations.ts`: Cronograma de pagamentos
- `profitCalculations.ts`: Análise de lucro e ROI

### `/src/utils/`
- `paymentSchedule.ts`: Geração do cronograma principal
- `types.ts`: Definições de tipos TypeScript
- `correctionData.ts`: Dados do índice CUB

## Fórmulas Principais

### Correção de Saldo
```
Saldo Corrigido = Saldo Anterior × (1 + Índice de Correção)
```

### Novo Saldo
```
Novo Saldo = Saldo Corrigido - Parcela do Mês
```

### Valorização do Imóvel
```
Valor Atual = Valor Base × (1 + Índice de Valorização)^mês
```

### Cálculo de Lucro
```
Lucro = Valor do Imóvel - Total Investido - Saldo Devedor
Percentual de Lucro = (Lucro / Total Investido) × 100
```

## Tipos de Correção

### Manual
- Índice fixo definido pelo usuário
- Aplicado mensalmente de forma constante

### CUB (Custo Unitário Básico)
- Índices oficiais do setor da construção
- Ciclo de 12 meses que se repete
- Baseado em dados históricos

## Estados da Aplicação

### FormData
Contém todos os parâmetros da simulação:
- Valor do imóvel
- Percentuais e valores de cada componente
- Datas importantes
- Índices de correção e valorização

### Schedule
Array de pagamentos com:
- Data do pagamento
- Descrição
- Valor
- Saldo devedor
- Valor acumulado pago
- Valor do imóvel no período

## Validações

### Percentuais
- Soma deve ser exatamente 100%
- Valores individuais não podem ser negativos

### Datas
- Data de avaliação obrigatória
- Data de entrega obrigatória
- Data de entrega deve ser posterior à avaliação

### Valores
- Valor do imóvel deve ser maior que zero
- Número de parcelas deve ser pelo menos 1

## Pontos de Extensão

### Novos Tipos de Correção
Implementar em `correctionCalculations.ts`:
```typescript
export const getCustomCorrection = (monthNumber: number, customData: any): number => {
  // Implementar nova lógica
}
```

### Novos Relatórios
Criar em `/src/lib/reports/`:
- Análise de fluxo de caixa
- Comparação de cenários
- Relatórios regulatórios

### Integração com Backend
- Salvar simulações no Supabase
- Histórico de clientes
- Templates de simulação
