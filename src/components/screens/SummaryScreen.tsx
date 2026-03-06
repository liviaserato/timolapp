import { useEffect, useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ContractScreen } from "@/components/screens/ContractScreen";
import { WizardData } from "@/types/wizard";
import { ChevronLeft, User, MapPin, Shield, Gem, Crown, Star, Ticket, X, Loader2 } from "lucide-react";

const franchiseIcons: Record<string, React.ReactNode> = {
  bronze: <Shield className="h-4 w-4" />,
  silver: <Star className="h-4 w-4" />,
  gold: <Crown className="h-4 w-4" />,
  platinum: <Gem className="h-4 w-4" />,
};

interface Props {
  data: WizardData;
  onConfirm: () => void;
  onBack: () => void;
  onEditPersonal?: () => void;
  onEditAddress?: () => void;
  onChangeFranchise?: () => void;
}

export const SummaryScreen = ({ data, onConfirm, onBack, onEditPersonal, onEditAddress, onChangeFranchise }: Props) => {
  const { t } = useLanguage();
  const [agreeContract, setAgreeContract] = useState(data.agreeContract ?? false);
  const [agreeCommunications, setAgreeCommunications] = useState(data.agreeCommunications ?? false);
  const [errors, setErrors] = useState<string[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [couponStatus, setCouponStatus] = useState<"idle" | "checking" | "valid" | "invalid" | "expired" | "notfound">("idle");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [isContractOpen, setIsContractOpen] = useState(false);

  useEffect(() => {
    if (!isContractOpen) return;

    const { style } = document.body;
    const previousOverflow = style.overflow;
    style.overflow = "hidden";

    return () => {
      style.overflow = previousOverflow;
    };
  }, [isContractOpen]);

  const handleConfirm = () => {
    const errs: string[] = [];
    if (!agreeContract) errs.push(t("summary.error.rules"));
    setErrors(errs);
    if (errs.length > 0) return;
    onConfirm();
  };

  const odataId = data.franchiseId ?? "—";

  const price = data.franchisePrice ?? 0;
  const isBrazil = (data.countryIso2 ?? "BR") === "BR";
  const isEuro = ["AT","BE","CY","EE","FI","FR","DE","GR","IE","IT","LV","LT","LU","MT","NL","PT","SK","SI","ES"].includes(data.countryIso2 ?? "");
  const sym = isBrazil ? "R$" : isEuro ? "€" : "US$";
  const locale = isBrazil ? "pt-BR" : isEuro ? "de-DE" : "en-US";
  const formatPrice = (v: number) => `${sym} ${v.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const discountedPrice = couponStatus === "valid" ? price - couponDiscount : price;

  const handleCouponCheck = () => {
    if (!couponCode.trim()) return;
    setCouponStatus("checking");
    setTimeout(() => {
      const code = couponCode.trim().toUpperCase();
      if (code === "TIMOL10") {
        setCouponDiscount(price * 0.1);
        setCouponStatus("valid");
      } else if (code === "TESTE") {
        setCouponDiscount(10);
        setCouponStatus("valid");
      } else if (code === "EXPIRED") {
        setCouponStatus("expired");
      } else {
        setCouponStatus("notfound");
      }
    }, 1000);
  };

  const handleCouponClear = () => {
    setCouponCode("");
    setCouponStatus("idle");
    setCouponDiscount(0);
  };

  const isForeigner = data.foreignerNoCpf === "true";

  function formatBirthDate(dateStr: string, countryIso2?: string): string {
    const [y, m, d] = dateStr.split("-");
    if (countryIso2 === "US") {
      const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
      return `${months[parseInt(m) - 1]} ${parseInt(d)}, ${y}`;
    }
    return `${d}-${m}-${y}`;
  }

  return (
    <>
      <div className="w-full max-w-lg mx-auto space-y-4">
        <div className="text-center space-y-1">
          <img src="/favicon.svg" alt="Timol" className="h-10 w-10 mx-auto" />
          <h2 className="text-2xl font-bold text-primary">{t("summary.title")}</h2>
          <p className="text-muted-foreground text-sm">{t("summary.subtitle")}</p>
        </div>

        {/* Personal Data — order: ID, Nome, CPF, Nascimento, Email, Usuário */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" />
                {t("summary.personal")}
              </CardTitle>
              {onEditPersonal && (
                <button onClick={onEditPersonal} className="text-[10px] text-primary/20 hover:text-primary/40 font-medium uppercase tracking-wide">
                  {t("summary.edit")}
                </button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <Row label="ID" value={odataId} />
            <Row label={t("summary.fullName")} value={data.fullName ?? "—"} />
            <Row label={isForeigner ? t("summary.document") : "CPF"} value={data.document || "—"} />
            <Row label={t("summary.birthDate")} value={data.birthDate ? formatBirthDate(data.birthDate, data.countryIso2) : "—"} />
            <Row label={t("summary.email")} value={data.email ?? "—"} />
            <Row label={t("summary.username")} value={data.username ?? "—"} />
          </CardContent>
        </Card>

        {/* Address — order: logradouro, bairro, cidade/estado, CEP, país */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {t("summary.address")}
              </CardTitle>
              {onEditAddress && (
                <button onClick={onEditAddress} className="text-[10px] text-primary/20 hover:text-primary/40 font-medium uppercase tracking-wide">
                  {t("summary.edit")}
                </button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <Row label={t("summary.addressLine")} value={`${data.street ?? ""}${data.number ? `, ${data.number}` : ""}${data.complement ? ` - ${data.complement}` : ""}`} />
            {data.neighborhood && <Row label={t("summary.neighborhood")} value={data.neighborhood} />}
            <Row label={t("summary.cityState")} value={`${data.cityId ?? "—"}, ${data.stateId ?? "—"}`} />
            <Row label={t("summary.zipCode")} value={data.zipCode ?? "—"} />
            <Row label={t("summary.country")} value={data.country ?? "—"} />
          </CardContent>
        </Card>

        {/* Franchise — order: patrocinador, plano, valor */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                {franchiseIcons[data.franchise ?? "bronze"]}
                {t("summary.franchise")}
              </CardTitle>
              {onChangeFranchise && (
                <button onClick={onChangeFranchise} className="text-[10px] text-primary/20 hover:text-primary/40 font-medium uppercase tracking-wide">
                  {t("summary.change")}
                </button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <Row label={t("summary.sponsor")} value={`${data.sponsorName ?? "—"} (ID ${data.sponsorFranchiseId ?? "—"})`} />
            <Row
              label={t("summary.franchiseChosen")}
              value={
                <span className="flex items-center gap-1.5 font-semibold">
                  {franchiseIcons[data.franchise ?? "bronze"]}
                  {t(`franchise.${data.franchise}`)}
                </span>
              }
            />
            <Row
              label={t("summary.price")}
              value={
                couponStatus === "valid" ? (
                  <div className="text-right">
                    <span className="text-sm text-muted-foreground relative">
                      <span className="relative inline-block">
                        {formatPrice(price)}
                        <span className="absolute left-0 right-0 top-1/2 h-[2px] bg-destructive -rotate-6" />
                      </span>
                    </span>
                    <br />
                    <span className="font-bold">{formatPrice(discountedPrice)}</span>
                    <p className="text-xs text-success">{t("summary.coupon.discountLabel")}</p>
                  </div>
                ) : (
                  <span className="font-bold">{formatPrice(price)}</span>
                )
              }
            />
          </CardContent>
        </Card>

        {/* Coupon */}
        <Card>
          <CardContent className="pt-4 space-y-2">
            <Label className="text-sm flex items-center gap-1.5">
              <Ticket className="h-4 w-4" />
              {t("summary.coupon")}
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  placeholder={t("summary.coupon.placeholder")}
                  value={couponCode}
                  onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponStatus("idle"); }}
                  maxLength={20}
                  className="pr-10 text-sm placeholder:text-xs sm:placeholder:text-sm"
                />
                {couponCode ? (
                  <button
                    type="button"
                    onClick={handleCouponClear}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : (
                  <Ticket className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <Button variant="outline" size="sm" onClick={handleCouponCheck} disabled={couponStatus === "checking"}>
                {couponStatus === "checking" ? <Loader2 className="h-4 w-4 animate-spin" /> : t("summary.coupon.apply")}
              </Button>
            </div>
            {couponStatus === "valid" && (
              <p className="text-xs text-success">{t("summary.coupon.valid")}</p>
            )}
            {couponStatus === "notfound" && (
              <p className="text-xs text-destructive">{t("summary.coupon.notfound")}</p>
            )}
            {couponStatus === "invalid" && (
              <p className="text-xs text-destructive">{t("summary.coupon.invalid")}</p>
            )}
            {couponStatus === "expired" && (
              <p className="text-xs text-amber-600">{t("summary.coupon.expired")}</p>
            )}
          </CardContent>
        </Card>

        {/* Agreements — vertically centered checkboxes */}
        <Card>
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-center gap-3">
              <Checkbox
                id="agreeRules"
                checked={agreeRules}
                onCheckedChange={(v) => { setAgreeRules(!!v); setErrors([]); }}
                className="mt-0"
              />
              <Label htmlFor="agreeRules" className="text-sm leading-snug cursor-pointer">
                {t("summary.agreeRules")}
                <button
                  type="button"
                  className="inline text-primary underline underline-offset-2 hover:text-primary/80"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsContractOpen(true);
                  }}
                >
                  {t("summary.agreeRules.link")}
                </button>
                {t("summary.agreeRules.suffix")}
              </Label>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox
                id="agreeCommunications"
                checked={agreeCommunications}
                onCheckedChange={(v) => setAgreeCommunications(!!v)}
                className="mt-0"
              />
              <Label htmlFor="agreeCommunications" className="text-sm leading-snug cursor-pointer">
                {t("summary.agreeCommunications")}
              </Label>
            </div>
            {errors.map((e) => (
              <p key={e} className="text-sm text-destructive">{e}</p>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-between gap-3">
          <Button variant="outline" onClick={onBack} className="flex-1">
            <ChevronLeft className="h-4 w-4 mr-1" />
            {t("btn.back")}
          </Button>
          <Button onClick={handleConfirm} className="flex-1">
            {t("summary.confirm")}
          </Button>
        </div>
      </div>

      {isContractOpen && <ContractScreen mode="modal" onClose={() => setIsContractOpen(false)} />}
    </>
  );
};

function Row({ label, value, highlight }: { label: string; value: React.ReactNode; highlight?: boolean }) {
  return (
    <div className="flex justify-between gap-3 py-1 border-b border-border/50 last:border-0">
      <span className="text-muted-foreground flex-shrink-0">{label}</span>
      <span className={`text-right break-words min-w-0 ${highlight ? "font-bold text-primary" : "font-medium"}`}>{value}</span>
    </div>
  );
}

