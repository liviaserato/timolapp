export interface CurrencyConfig {
  code: string;
  symbol: string;
  locale: string;
  showPix: boolean;
}

export function getCurrencyConfig(country: string, currency: string): CurrencyConfig {
  const isBRL = currency === "BRL" && country === "BR";
  const localeMap: Record<string, string> = {
    BRL: "pt-BR",
    USD: "en-US",
    EUR: "de-DE",
  };
  const symbolMap: Record<string, string> = {
    BRL: "R$",
    USD: "US$",
    EUR: "€",
  };
  return {
    code: currency,
    symbol: symbolMap[currency] ?? currency,
    locale: localeMap[currency] ?? "en-US",
    showPix: isBRL,
  };
}

export function formatCurrency(value: number, config: CurrencyConfig): string {
  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: config.code,
    minimumFractionDigits: 2,
  }).format(value);
}

/** Returns symbol and number parts separately for split rendering */
export function formatCurrencySplit(value: number, config: CurrencyConfig): { symbol: string; number: string } {
  const abs = Math.abs(value);
  const numStr = new Intl.NumberFormat(config.locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(abs);
  const sign = value < 0 ? "-" : "";
  return {
    symbol: `${sign}${config.symbol}`,
    number: numStr,
  };
}
