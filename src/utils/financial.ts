import type { ModuleResult, ResultTable } from "../types/finance";
import { formatCurrency, formatNumber, formatPercent } from "./format";

const monthlyRate = (annualRate: number) => annualRate / 12 / 100;

const safeDivide = (value: number, divisor: number) => (divisor === 0 ? 0 : value / divisor);

const paymentFromRate = (principal: number, annualRate: number, months: number) => {
  if (months <= 0) {
    return 0;
  }

  const rate = monthlyRate(annualRate);

  if (rate === 0) {
    return principal / months;
  }

  return (principal * rate) / (1 - Math.pow(1 + rate, -months));
};

const futureValueRecurring = (
  monthlyContribution: number,
  annualRate: number,
  months: number,
  initialAmount = 0,
) => {
  const rate = monthlyRate(annualRate);

  if (months <= 0) {
    return initialAmount;
  }

  if (rate === 0) {
    return initialAmount + monthlyContribution * months;
  }

  const growth = Math.pow(1 + rate, months);
  return initialAmount * growth + monthlyContribution * ((growth - 1) / rate);
};

const generateAmortizationTable = (
  principal: number,
  annualRate: number,
  months: number,
  limit = 12,
): ResultTable => {
  const payment = paymentFromRate(principal, annualRate, months);
  const rate = monthlyRate(annualRate);
  let balance = principal;

  const rows = Array.from({ length: Math.min(months, limit) }, (_, index) => {
    const interest = balance * rate;
    const capital = payment - interest;
    balance = Math.max(0, balance - capital);

    return [
      index + 1,
      formatCurrency(payment),
      formatCurrency(capital),
      formatCurrency(interest),
      formatCurrency(balance),
    ];
  });

  return {
    title: "Amortización inicial",
    columns: ["Mes", "Pago", "Capital", "Interés", "Saldo"],
    rows,
  };
};

const buildResult = (result: ModuleResult): ModuleResult => result;

export const calculateMortgage = (input: {
  loanAmount: number;
  annualRate: number;
  termYears: number;
}) => {
  const months = input.termYears * 12;
  const monthlyPayment = paymentFromRate(input.loanAmount, input.annualRate, months);
  const totalPaid = monthlyPayment * months;
  const totalInterest = totalPaid - input.loanAmount;

  return buildResult({
    headline: "Escenario hipotecario",
    status:
      totalInterest > input.loanAmount
        ? "La carga financiera supera el capital prestado; conviene revisar plazo o tasa."
        : "El escenario mantiene un costo financiero razonable para un crédito largo.",
    summary: [
      { label: "Pago mensual", value: monthlyPayment, tone: "primary" },
      { label: "Total pagado", value: totalPaid },
      { label: "Intereses totales", value: totalInterest, tone: "warning" },
    ],
    details: [
      { label: "Monto del crédito", value: input.loanAmount },
      { label: "Tasa anual", value: `${input.annualRate}%` },
      { label: "Plazo", value: `${months} meses` },
      { label: "Relación interés/capital", value: formatPercent(safeDivide(totalInterest, input.loanAmount) * 100) },
    ],
    insights: [
      `La mensualidad estimada es ${formatCurrency(monthlyPayment)} durante ${months} meses.`,
      `El costo financiero acumulado ronda ${formatCurrency(totalInterest)}.`,
      "La tabla muestra el arranque del calendario de amortización para presentar escenarios.",
    ],
    tables: [generateAmortizationTable(input.loanAmount, input.annualRate, months)],
    exportData: {
      modulo: "Hipotecario",
      ...input,
      monthlyPayment,
      totalPaid,
      totalInterest,
    },
  });
};

export const calculateCreditCard = (input: {
  balance: number;
  annualRate: number;
  payoffMonths: number;
  minPaymentRate: number;
}) => {
  const targetPayment = paymentFromRate(input.balance, input.annualRate, input.payoffMonths);
  const totalPaid = targetPayment * input.payoffMonths;
  const financeCost = totalPaid - input.balance;

  const rate = monthlyRate(input.annualRate);
  let balance = input.balance;
  let minMonths = 0;
  let minTotalPaid = 0;

  while (balance > 1 && minMonths < 600) {
    const interest = balance * rate;
    const payment = Math.max(balance * (input.minPaymentRate / 100), interest * 1.15, 300);
    balance = Math.max(0, balance + interest - payment);
    minTotalPaid += payment;
    minMonths += 1;
  }

  const minFinanceCost = minTotalPaid - input.balance;

  return buildResult({
    headline: "Liquidación de tarjeta",
    status:
      minMonths >= 600
        ? "El pago mínimo prácticamente no liquida la deuda en un horizonte sano."
        : "Se compara un pago objetivo contra la inercia del pago mínimo.",
    summary: [
      { label: "Pago objetivo", value: targetPayment, tone: "primary" },
      { label: "Total pagado", value: totalPaid },
      { label: "Costo financiero", value: financeCost, tone: "warning" },
    ],
    details: [
      { label: "Saldo actual", value: input.balance },
      { label: "Tasa anual", value: `${input.annualRate}%` },
      { label: "Plazo objetivo", value: `${input.payoffMonths} meses` },
      {
        label: "Pago mínimo proyectado",
        value: `${formatNumber(minMonths)} meses / ${formatCurrency(minTotalPaid)}`,
      },
    ],
    insights: [
      `Con un pago objetivo de ${formatCurrency(targetPayment)} la deuda se liquidaría en ${input.payoffMonths} meses.`,
      `Mantener solo el pago mínimo eleva el costo a ${formatCurrency(minFinanceCost)} en intereses aproximados.`,
      "Este módulo sirve para vender una estrategia clara de saneamiento financiero.",
    ],
    exportData: {
      modulo: "Tarjeta de crédito",
      ...input,
      targetPayment,
      totalPaid,
      financeCost,
      minMonths,
      minTotalPaid,
      minFinanceCost,
    },
  });
};

export const calculateBankLoan = (input: {
  amount: number;
  annualRate: number;
  termMonths: number;
}) => {
  const monthlyPayment = paymentFromRate(input.amount, input.annualRate, input.termMonths);
  const totalPaid = monthlyPayment * input.termMonths;
  const totalInterest = totalPaid - input.amount;

  return buildResult({
    headline: "Préstamo bancario",
    status: "Escenario listo para comparar distintas combinaciones de tasa y plazo.",
    summary: [
      { label: "Pago mensual", value: monthlyPayment, tone: "primary" },
      { label: "Total pagado", value: totalPaid },
      { label: "Interés total", value: totalInterest, tone: "warning" },
    ],
    details: [
      { label: "Monto", value: input.amount },
      { label: "Plazo", value: `${input.termMonths} meses` },
      { label: "Tasa anual", value: `${input.annualRate}%` },
    ],
    insights: [
      `La mensualidad proyectada es ${formatCurrency(monthlyPayment)}.`,
      `El costo acumulado por intereses sería de ${formatCurrency(totalInterest)}.`,
    ],
    tables: [generateAmortizationTable(input.amount, input.annualRate, input.termMonths, 10)],
    exportData: {
      modulo: "Préstamo bancario",
      ...input,
      monthlyPayment,
      totalPaid,
      totalInterest,
    },
  });
};

export const calculateAutoLoan = (input: {
  vehiclePrice: number;
  downPayment: number;
  annualRate: number;
  termMonths: number;
}) => {
  const financedAmount = Math.max(0, input.vehiclePrice - input.downPayment);
  const monthlyPayment = paymentFromRate(financedAmount, input.annualRate, input.termMonths);
  const totalPaid = monthlyPayment * input.termMonths + input.downPayment;
  const financeCost = totalPaid - input.vehiclePrice;

  return buildResult({
    headline: "Crédito automotriz",
    status:
      input.downPayment < input.vehiclePrice * 0.2
        ? "Un enganche mayor ayudaría a reducir sensiblemente el costo total."
        : "El enganche amortigua bien la carga financiera del vehículo.",
    summary: [
      { label: "Monto financiado", value: financedAmount },
      { label: "Mensualidad", value: monthlyPayment, tone: "primary" },
      { label: "Costo total final", value: totalPaid },
    ],
    details: [
      { label: "Valor del auto", value: input.vehiclePrice },
      { label: "Enganche", value: input.downPayment },
      { label: "Costo financiero", value: financeCost },
      { label: "Plazo", value: `${input.termMonths} meses` },
    ],
    insights: [
      `Se financian ${formatCurrency(financedAmount)} con una mensualidad cercana a ${formatCurrency(monthlyPayment)}.`,
      `El costo adicional sobre el valor del auto sería de ${formatCurrency(financeCost)}.`,
    ],
    exportData: {
      modulo: "Crédito automotriz",
      ...input,
      financedAmount,
      monthlyPayment,
      totalPaid,
      financeCost,
    },
  });
};

export const calculateTravelBudget = (input: {
  targetBudget: number;
  transport: number;
  lodging: number;
  meals: number;
  activities: number;
  buffer: number;
}) => {
  const totalEstimated =
    input.transport + input.lodging + input.meals + input.activities + input.buffer;
  const remaining = input.targetBudget - totalEstimated;
  const usage = safeDivide(totalEstimated, input.targetBudget) * 100;

  return buildResult({
    headline: "Presupuesto de viaje",
    status:
      remaining >= 0
        ? "El viaje entra dentro del presupuesto objetivo con margen disponible."
        : "El viaje rebasa el presupuesto objetivo; conviene ajustar categorías.",
    summary: [
      { label: "Presupuesto total", value: input.targetBudget },
      { label: "Gasto estimado", value: totalEstimated, tone: "primary" },
      {
        label: remaining >= 0 ? "Remanente" : "Excedente",
        value: Math.abs(remaining),
        tone: remaining >= 0 ? "success" : "warning",
      },
    ],
    details: [
      { label: "Transporte", value: input.transport },
      { label: "Hospedaje", value: input.lodging },
      { label: "Comidas", value: input.meals },
      { label: "Uso del presupuesto", value: formatPercent(usage) },
    ],
    insights: [
      `La categoría más pesada se concentra entre hospedaje y transporte.`,
      `El escenario actual ${remaining >= 0 ? "deja" : "muestra"} ${formatCurrency(Math.abs(remaining))} ${remaining >= 0 ? "libres" : "por recortar"}.`,
      "La estructura puede crecer después a más presupuestos personales sin cambiar la UI principal.",
    ],
    exportData: {
      modulo: "Presupuesto de viaje",
      ...input,
      totalEstimated,
      remaining,
      usage,
    },
  });
};

export const calculateSavings = (input: {
  targetAmount: number;
  monthlyContribution: number;
  annualRate: number;
  termYears: number;
  currentSavings: number;
}) => {
  const months = input.termYears * 12;
  const futureValue = futureValueRecurring(
    input.monthlyContribution,
    input.annualRate,
    months,
    input.currentSavings,
  );
  const gap = input.targetAmount - futureValue;

  return buildResult({
    headline: "Plan de ahorro",
    status:
      gap <= 0
        ? "La meta es alcanzable con los supuestos actuales."
        : "Falta ajustar aportación, plazo o rendimiento esperado para cumplir la meta.",
    summary: [
      { label: "Meta de ahorro", value: input.targetAmount },
      { label: "Valor futuro", value: futureValue, tone: "primary" },
      {
        label: gap <= 0 ? "Excedente meta" : "Diferencia contra meta",
        value: Math.abs(gap),
        tone: gap <= 0 ? "success" : "warning",
      },
    ],
    details: [
      { label: "Aportación mensual", value: input.monthlyContribution },
      { label: "Tasa estimada", value: `${input.annualRate}%` },
      { label: "Plazo", value: `${input.termYears} años` },
      { label: "Ahorro actual", value: input.currentSavings },
    ],
    insights: [
      `Con aportaciones de ${formatCurrency(input.monthlyContribution)} el capital proyectado sería ${formatCurrency(futureValue)}.`,
      "La arquitectura queda lista para conectar instrumentos como CETES o fondos con perfiles distintos.",
    ],
    exportData: {
      modulo: "Ahorro e instrumentos",
      ...input,
      months,
      futureValue,
      gap,
    },
  });
};

export const calculateRoi = (input: {
  initialInvestment: number;
  finalValue: number;
  years: number;
  periodicContribution: number;
}) => {
  const totalContribution = input.periodicContribution * input.years * 12;
  const totalInvested = input.initialInvestment + totalContribution;
  const roi = safeDivide(input.finalValue - input.initialInvestment, input.initialInvestment) * 100;
  const annualizedRate =
    input.initialInvestment > 0 && input.finalValue > 0 && input.years > 0
      ? (Math.pow(input.finalValue / input.initialInvestment, 1 / input.years) - 1) * 100
      : 0;
  const projection = futureValueRecurring(
    input.periodicContribution,
    annualizedRate,
    input.years * 12,
    input.initialInvestment,
  );

  return buildResult({
    headline: "Retorno de inversión",
    status:
      roi > 0
        ? "La inversión genera retorno positivo con los supuestos capturados."
        : "El escenario no muestra retorno positivo respecto al capital inicial.",
    summary: [
      { label: "ROI", value: `${roi.toFixed(1)}%`, tone: roi >= 0 ? "success" : "warning" },
      { label: "Valor final", value: input.finalValue, tone: "primary" },
      { label: "Proyección con aportaciones", value: projection },
    ],
    details: [
      { label: "Inversión inicial", value: input.initialInvestment },
      { label: "Aportación periódica", value: input.periodicContribution },
      { label: "Horizonte", value: `${input.years} años` },
      { label: "Tasa anualizada implícita", value: formatPercent(annualizedRate) },
    ],
    insights: [
      `El escenario ajustado con aportaciones periódicas proyecta ${formatCurrency(projection)}.`,
      `El capital total comprometido en el horizonte sería ${formatCurrency(totalInvested)}.`,
    ],
    exportData: {
      modulo: "ROI",
      ...input,
      totalContribution,
      totalInvested,
      roi,
      annualizedRate,
      projection,
    },
  });
};

export const calculateBreakEven = (input: {
  fixedCosts: number;
  salePrice: number;
  variableCostPerUnit: number;
  projectedUnits: number;
}) => {
  const contributionMargin = input.salePrice - input.variableCostPerUnit;
  const breakEvenUnits = safeDivide(input.fixedCosts, contributionMargin);
  const breakEvenRevenue = breakEvenUnits * input.salePrice;
  const projectedProfit =
    contributionMargin * input.projectedUnits - input.fixedCosts;

  return buildResult({
    headline: "Punto de equilibrio",
    status:
      contributionMargin <= 0
        ? "El margen de contribución es insuficiente; el negocio pierde por unidad."
        : "El módulo muestra el mínimo de unidades necesarias para no perder.",
    summary: [
      { label: "Margen de contribución", value: contributionMargin, tone: "primary" },
      { label: "Punto de equilibrio unidades", value: `${breakEvenUnits.toFixed(0)} unidades` },
      { label: "Punto de equilibrio dinero", value: breakEvenRevenue },
    ],
    details: [
      { label: "Costos fijos", value: input.fixedCosts },
      { label: "Precio de venta", value: input.salePrice },
      { label: "Costo variable", value: input.variableCostPerUnit },
      { label: "Utilidad proyectada", value: projectedProfit },
    ],
    insights: [
      `Cada unidad deja ${formatCurrency(contributionMargin)} antes de absorber costos fijos.`,
      `Con ${formatNumber(input.projectedUnits)} unidades vendidas, la utilidad estimada sería ${formatCurrency(projectedProfit)}.`,
    ],
    exportData: {
      modulo: "Punto de equilibrio",
      ...input,
      contributionMargin,
      breakEvenUnits,
      breakEvenRevenue,
      projectedProfit,
    },
  });
};

export const calculateBusinessFeasibility = (input: {
  initialInvestment: number;
  estimatedMonthlyRevenue: number;
  fixedMonthlyCosts: number;
  variableMonthlyCosts: number;
}) => {
  const monthlyProfit =
    input.estimatedMonthlyRevenue - input.fixedMonthlyCosts - input.variableMonthlyCosts;
  const paybackMonths =
    monthlyProfit > 0 ? input.initialInvestment / monthlyProfit : Number.POSITIVE_INFINITY;
  const annualReturn = safeDivide(monthlyProfit * 12, input.initialInvestment) * 100;

  let conclusion = "Riesgoso";
  if (monthlyProfit <= 0) {
    conclusion = "No rentable con estos supuestos";
  } else if (annualReturn >= 20 && paybackMonths <= 24) {
    conclusion = "Viable";
  }

  return buildResult({
    headline: "Evaluación previa del negocio",
    status: conclusion,
    summary: [
      { label: "Utilidad mensual", value: monthlyProfit, tone: monthlyProfit > 0 ? "success" : "warning" },
      {
        label: "Payback",
        value: Number.isFinite(paybackMonths) ? `${paybackMonths.toFixed(1)} meses` : "No recuperable",
        tone: "primary",
      },
      { label: "Retorno anual proyectado", value: `${annualReturn.toFixed(1)}%` },
    ],
    details: [
      { label: "Inversión inicial", value: input.initialInvestment },
      { label: "Ingresos mensuales", value: input.estimatedMonthlyRevenue },
      { label: "Costos fijos", value: input.fixedMonthlyCosts },
      { label: "Costos variables", value: input.variableMonthlyCosts },
    ],
    insights: [
      `La utilidad mensual estimada es ${formatCurrency(monthlyProfit)}.`,
      Number.isFinite(paybackMonths)
        ? `La inversión se recuperaría en aproximadamente ${paybackMonths.toFixed(1)} meses.`
        : "Con los supuestos actuales la inversión no se recupera.",
      `Conclusión ejecutiva: ${conclusion}.`,
    ],
    exportData: {
      modulo: "Rentabilidad de negocio",
      ...input,
      monthlyProfit,
      paybackMonths: Number.isFinite(paybackMonths) ? paybackMonths : null,
      annualReturn,
      conclusion,
    },
  });
};
