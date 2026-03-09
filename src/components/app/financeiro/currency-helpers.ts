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
