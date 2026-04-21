export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);

export const formatPercent = (value: number, digits = 1) =>
  `${(Number.isFinite(value) ? value : 0).toFixed(digits)}%`;

export const formatNumber = (value: number, digits = 0) =>
  new Intl.NumberFormat("es-MX", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(Number.isFinite(value) ? value : 0);

export const formatMetricValue = (value: number | string, label?: string) => {
  if (typeof value === "string") {
    return value;
  }

  const lowerLabel = label?.toLowerCase() ?? "";

  if (lowerLabel.includes("tasa") || lowerLabel.includes("roi") || lowerLabel.includes("%")) {
    return formatPercent(value);
  }

  if (
    lowerLabel.includes("mes") ||
    lowerLabel.includes("año") ||
    lowerLabel.includes("unidades")
  ) {
    return formatNumber(value, 0);
  }

  return formatCurrency(value);
};
