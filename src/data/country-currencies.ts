/**
 * ISO 3166-1 alpha-2 → ISO 4217 currency code mapping.
 * Used for validating address currency against franchise currency.
 */
const countryCurrencyMap: Record<string, string> = {
  AF: "AFN", ZA: "ZAR", AL: "ALL", DE: "EUR", AD: "EUR", AO: "AOA",
  AG: "XCD", SA: "SAR", AR: "ARS", AM: "AMD", AU: "AUD", AT: "EUR",
  AZ: "AZN", BS: "BSD", BH: "BHD", BD: "BDT", BB: "BBD", BY: "BYN",
  BE: "EUR", BZ: "BZD", BJ: "XOF", BO: "BOB", BA: "BAM", BW: "BWP",
  BR: "BRL", BN: "BND", BG: "BGN", BF: "XOF", BI: "BIF", CV: "CVE",
  CM: "XAF", KH: "KHR", CA: "CAD", QA: "QAR", KZ: "KZT", TD: "XAF",
  CL: "CLP", CN: "CNY", CY: "EUR", CO: "COP", KM: "KMF", CG: "XAF",
  KP: "KPW", KR: "KRW", CI: "XOF", CR: "CRC", HR: "EUR", CU: "CUP",
  DK: "DKK", DJ: "DJF", DM: "XCD", EG: "EGP", SV: "USD", AE: "AED",
  EC: "USD", ER: "ERN", SK: "EUR", SI: "EUR", ES: "EUR", US: "USD",
  EE: "EUR", ET: "ETB", FJ: "FJD", PH: "PHP", FI: "EUR", FR: "EUR",
  GA: "XAF", GM: "GMD", GH: "GHS", GE: "GEL", GD: "XCD", GR: "EUR",
  GT: "GTQ", GN: "GNF", GW: "XOF", GQ: "XAF", GY: "GYD", HT: "HTG",
  HN: "HNL", HU: "HUF", YE: "YER", IN: "INR", ID: "IDR", IQ: "IQD",
  IR: "IRR", IE: "EUR", IS: "ISK", IL: "ILS", IT: "EUR", JM: "JMD",
  JP: "JPY", JO: "JOD", KW: "KWD", LA: "LAK", LS: "LSL", LV: "EUR",
  LB: "LBP", LR: "LRD", LY: "LYD", LI: "CHF", LT: "EUR", LU: "EUR",
  MG: "MGA", MY: "MYR", MW: "MWK", MV: "MVR", ML: "XOF", MT: "EUR",
  MA: "MAD", MR: "MRU", MU: "MUR", MX: "MXN", MD: "MDL", MC: "EUR",
  MN: "MNT", ME: "EUR", MZ: "MZN", MM: "MMK", NA: "NAD", NP: "NPR",
  NI: "NIO", NE: "XOF", NG: "NGN", NO: "NOK", NZ: "NZD", OM: "OMR",
  NL: "EUR", PK: "PKR", PW: "USD", PS: "ILS", PA: "PAB", PG: "PGK",
  PY: "PYG", PE: "PEN", PL: "PLN", PT: "EUR", PR: "USD", KE: "KES",
  KG: "KGS", GB: "GBP", CF: "XAF", CD: "CDF", DO: "DOP", RO: "RON",
  RW: "RWF", RU: "RUB", AS: "USD", ST: "STN", WS: "WST", SN: "XOF",
  SL: "SLE", RS: "RSD", SG: "SGD", SY: "SYP", SO: "SOS", LK: "LKR",
  SD: "SDG", SS: "SSP", SE: "SEK", CH: "CHF", SR: "SRD", TH: "THB",
  TJ: "TJS", TZ: "TZS", TL: "USD", TG: "XOF", TT: "TTD", TN: "TND",
  TM: "TMT", TR: "TRY", UA: "UAH", UG: "UGX", UY: "UYU", UZ: "UZS",
  VU: "VUV", VE: "VES", VN: "VND", VI: "USD", GU: "USD", MP: "USD",
  ZW: "ZWL",
};

/** Returns the ISO 4217 currency code for a given ISO 3166-1 alpha-2 country code */
export function getCountryCurrency(iso2: string): string {
  return countryCurrencyMap[iso2] ?? "USD";
}
