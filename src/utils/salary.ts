export type SalaryDisplayInput = {
  min_salary?: number | string | null;
  max_salary?: number | string | null;
  med_salary?: number | string | null;
  currency?: string | null;
  pay_period?: string | null;
};

export const formatSalaryRange = (
  salary: SalaryDisplayInput | null | undefined,
) => {
  if (!salary) return "Thỏa thuận";

  const min = getPositiveNumber(salary.min_salary);
  const max = getPositiveNumber(salary.max_salary);
  const med = getPositiveNumber(salary.med_salary);

  if (min === null && max === null && med === null) {
    return "Thỏa thuận";
  }

  const currency = normalizeCurrency(salary.currency);
  const suffix = getCurrencySuffix(currency, salary.pay_period);
  const formatAmount = (value: number) => formatRawAmount(value, currency);

  if (min !== null && max !== null) {
    return `${formatAmount(min)}–${formatAmount(max)}${suffix}`;
  }

  if (min !== null) {
    return `Từ ${formatAmount(min)}${suffix}`;
  }

  if (max !== null) {
    return `Đến ${formatAmount(max)}${suffix}`;
  }

  return `${formatAmount(med!)}${suffix}`;
};

const getPositiveNumber = (value: number | string | null | undefined) => {
  if (value === null || value === undefined || value === "") return null;

  const numericValue = Number(value);
  return Number.isFinite(numericValue) && numericValue > 0
    ? numericValue
    : null;
};

const normalizeCurrency = (currency: string | null | undefined) => {
  const normalizedCurrency = (currency || "VND").trim().toUpperCase();

  if (["VNĐ", "DONG", "Đ"].includes(normalizedCurrency)) return "VND";
  return normalizedCurrency || "VND";
};

const getCurrencySuffix = (
  currency: string,
  payPeriod: string | null | undefined,
) => {
  const periodLabel = getPayPeriodLabel(payPeriod);

  if (currency === "USD") return periodLabel;
  return ` ${currency}${periodLabel}`;
};

const getPayPeriodLabel = (payPeriod: string | null | undefined) => {
  const normalizedPeriod = (payPeriod || "").trim().toLowerCase();

  switch (normalizedPeriod) {
    case "hourly":
    case "hour":
      return "/giờ";
    case "daily":
    case "day":
      return "/ngày";
    case "weekly":
    case "week":
      return "/tuần";
    case "monthly":
    case "month":
      return "/tháng";
    case "yearly":
    case "annual":
    case "annually":
    case "year":
      return "/năm";
    default:
      return "";
  }
};

const formatRawAmount = (value: number, currency: string) => {
  if (currency === "VND") {
    if (value >= 1_000_000) return `${Math.round(value / 1_000_000)}tr`;
    if (value >= 1_000) return `${Math.round(value / 1_000)}K`;
    return Math.round(value).toLocaleString("vi-VN");
  }

  if (currency === "USD") {
    if (value >= 1_000) return `$${Math.round(value / 1_000)}K`;
    return `$${Math.round(value).toLocaleString("en-US")}`;
  }

  return Math.round(value).toLocaleString("en-US");
};
