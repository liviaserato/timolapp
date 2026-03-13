import { useState } from "react";
import { countries } from "@/data/countries";
import { useLanguage } from "@/i18n/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StepPersonal } from "./StepPersonal";
import { StepContact } from "./StepContact";
import { StepAddress } from "./StepAddress";
import { StepLogin } from "./StepLogin";
import { DocumentCheckPopup } from "./DocumentCheckPopup";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { FullScreenTimolLoader } from "@/components/ui/full-screen-timol-loader";
import { WizardData } from "@/types/wizard";
import { useDocumentCheck } from "@/hooks/useDocumentCheck";

const TOTAL_STEPS = 4;

interface Props {
  initialData?: WizardData;
  initialStep?: number;
  onComplete: (data: WizardData) => void;
  onBack?: () => void;
}

export const RegistrationWizard = ({ initialData = {}, initialStep = 1, onComplete, onBack: onBackToSponsor }: Props) => {
  const { t, language } = useLanguage();
  const [step, setStep] = useState(initialStep);
  const [data, setData] = useState<Record<string, string>>({
    fullName: initialData.fullName ?? "",
    birthDate: initialData.birthDate ?? "",
    document: initialData.document ?? "",
    gender: initialData.gender ?? "",
    email: initialData.email ?? "",
    phoneDdi: initialData.phoneDdi ?? "BR",
    phoneNumber: initialData.phoneNumber ?? "",
    country: initialData.country ?? "",
    countryIso2: initialData.countryIso2 ?? "",
    zipCode: initialData.zipCode ?? "",
    street: initialData.street ?? "",
    number: initialData.number ?? "",
    complement: initialData.complement ?? "",
    neighborhood: initialData.neighborhood ?? "",
    cityId: initialData.cityId ?? "",
    stateId: initialData.stateId ?? "",
    username: initialData.username ?? "",
    password: initialData.password ?? "",
    confirmPassword: initialData.confirmPassword ?? "",
    foreignerNoCpf: initialData.foreignerNoCpf ?? "false",
    documentCountry: initialData.documentCountry ?? "",
    documentCountryCode: initialData.documentCountryCode ?? "",
    documentCountryFlag: initialData.documentCountryFlag ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [apiError, setApiError] = useState("");

  // Document check via hook (debounced, reactive)
  const isForeigner = data.foreignerNoCpf === "true";
  const {
    checking: docChecking,
    result: docCheckResult,
    error: docCheckError,
    reset: resetDocCheck,
  } = useDocumentCheck({
    document: data.document,
    isForeigner,
    issuerCountryIso2: isForeigner ? data.documentCountryCode : "BR",
    enabled: step === 1,
  });

  // Popup state
  const [showDocCheck, setShowDocCheck] = useState(false);

  // Document is blocked if exists=true
  const docBlocked = docCheckResult?.exists === true;
  // Document is not yet validated if still checking, has error, or API hasn't responded yet
  const rawDocClean = isForeigner ? data.document.trim() : data.document.replace(/\D/g, "");
  const docShouldBeValidated = isForeigner
    ? rawDocClean.length > 0 && !!data.documentCountryCode
    : rawDocClean.length === 11;
  const docNotValidated = step === 1
    ? (docChecking || !!docCheckError || (docShouldBeValidated && !docCheckResult))
    : false;

  const onChange = (field: string, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    const req = t("validation.required");

    if (step === 1) {
      if (!data.fullName?.trim()) newErrors.fullName = req;
      if (!data.birthDate) {
        newErrors.birthDate = req;
      } else {
        const birth = new Date(data.birthDate);
        const today = new Date();
        const age = today.getFullYear() - birth.getFullYear() -
          (today < new Date(today.getFullYear(), birth.getMonth(), birth.getDate()) ? 1 : 0);
        if (age < 18) newErrors.birthDate = t("validation.ageMin18");
      }
      if (isForeigner && !data.documentCountry?.trim()) {
        newErrors.documentCountry = req;
      }
      if (!data.document?.trim()) {
        newErrors.document = req;
      } else if (!isForeigner && !validateCPF(data.document)) {
        newErrors.document = t("validation.cpfInvalid");
      }
      if (!data.gender) newErrors.gender = req;
    } else if (step === 2) {
      if (!data.email?.trim()) newErrors.email = req;
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) newErrors.email = t("validation.email");
      if (!data.phoneNumber?.trim()) newErrors.phoneNumber = req;
      else if (data.phoneNumber.replace(/\D/g, "").length < 5) newErrors.phoneNumber = t("validation.phoneMin");
    } else if (step === 3) {
      if (!data.country?.trim()) newErrors.country = req;
      if (!data.zipCode?.trim()) newErrors.zipCode = req;
      if (!data.street?.trim()) newErrors.street = req;
      if (!data.number?.trim()) newErrors.number = req;
      if (!data.cityId?.trim()) newErrors.cityId = req;
      if (!data.stateId?.trim()) newErrors.stateId = req;
    } else if (step === 4) {
      if (!data.username?.trim()) {
        newErrors.username = req;
      } else if (!/^[a-z0-9._]*$/.test(data.username)) {
        newErrors.username = t("step4.username.invalidCharsSubmit");
      } else if (data.username.length > 20) {
        newErrors.username = t("step4.username.hint");
      }
      if (!data.password) newErrors.password = req;
      else if (data.password.length < 6) newErrors.password = t("validation.passwordMin");
      if (!data.confirmPassword) newErrors.confirmPassword = req;
      else if (data.password !== data.confirmPassword)
        newErrors.confirmPassword = t("validation.passwordMatch");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateStep()) return;

    // On step 1, if doc exists → show popup, block
    if (step === 1 && docBlocked) {
      setShowDocCheck(true);
      return;
    }

    // If doc not yet validated (checking/error/no result), block
    if (step === 1 && docNotValidated) {
      return;
    }

    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };

  const handleBack = () => setStep((s) => Math.max(s - 1, 1));

  // ⚠️ TEMPORARY: Set to false when the real API is ready
  const DEV_BYPASS_REGISTRATION = true;

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setLoading(true);
    setApiError("");

    try {
      const alreadyRegistered = !!initialData.franchiseId;
      let authUid: string | undefined;

      if (!alreadyRegistered) {
        if (DEV_BYPASS_REGISTRATION) {
          // DEV: skip Supabase signup, generate a fake uid
          authUid = crypto.randomUUID();
          console.warn("[DEV BYPASS] Skipping auth.signUp — fake authUid:", authUid);
        } else {
          const { error: signUpError, data: authData } = await supabase.auth.signUp({
            email: data.email.trim(),
            password: data.password,
            options: { emailRedirectTo: window.location.origin },
          });

          if (signUpError) throw signUpError;
          authUid = authData?.user?.id;
        }

        if (authUid && !DEV_BYPASS_REGISTRATION) {
          await supabase.from("profiles").update({
            full_name: data.fullName?.trim(),
            birth_date: data.birthDate || null,
            document: data.document?.trim(),
            gender: data.gender,
            phone: data.phoneDdi ? `${countries.find(c => c.iso2 === data.phoneDdi)?.dialCode || "+55"} ${data.phoneNumber?.trim()}` : data.phoneNumber?.trim(),
            zip_code: data.zipCode?.trim(),
            street: data.street?.trim(),
            number: data.number?.trim(),
            complement: data.complement?.trim() || null,
            neighborhood: data.neighborhood?.trim() || null,
            city: data.cityId?.trim(),
            state: data.stateId?.trim(),
            country: data.country?.trim(),
            username: data.username?.trim(),
            preferred_language: language,
          }).eq("user_id", authUid);

          // Track registration status for recovery emails (via edge function to bypass RLS)
          await supabase.functions.invoke("track-registration", {
            body: {
              mode: "insert",
              user_id: authUid,
              full_name: data.fullName?.trim(),
              email: data.email.trim(),
              document: data.document?.trim(),
              sponsor_name: initialData.sponsorName || null,
              sponsor_id: initialData.sponsorFranchiseId || null,
              phone: data.phoneDdi ? `${countries.find(c => c.iso2 === data.phoneDdi)?.dialCode || "+55"} ${data.phoneNumber?.trim()}` : data.phoneNumber?.trim() || null,
              preferred_language: language,
              sponsor_source: initialData.sponsorSelectionMethod || null,
              gender: data.gender || null,
            },
          });
        }
      }

      onComplete({
        ...initialData,
        fullName: data.fullName,
        birthDate: data.birthDate,
        document: data.document,
        foreignerNoCpf: data.foreignerNoCpf,
        documentCountry: data.documentCountry,
        documentCountryCode: data.documentCountryCode,
        documentCountryFlag: data.documentCountryFlag,
        gender: data.gender,
        email: data.email,
        phoneDdi: data.phoneDdi,
        phoneNumber: data.phoneNumber,
        country: data.country,
        countryIso2: data.countryIso2,
        zipCode: data.zipCode,
        street: data.street,
        number: data.number,
        complement: data.complement,
        neighborhood: data.neighborhood,
        cityId: data.cityId,
        stateId: data.stateId,
        username: data.username,
        documentCheckPassed: !docBlocked,
        authUserId: alreadyRegistered ? initialData.authUserId : authUid,
        franchiseId: initialData.franchiseId ?? (authUid ? String(Math.floor(100000 + Math.random() * 900000)) : undefined),
      });
    } catch (err: unknown) {
      const e = err as Error;
      setApiError(e?.message || t("submit.error"));
    } finally {
      setLoading(false);
    }
  };

  const stepTitles = [
    t("step1.title"),
    t("step2.title"),
    t("step3.title"),
    t("step4.title"),
  ];

  return (
    <>
      <Card className="w-full max-w-lg mx-auto shadow-lg">
        <CardHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <img src="/favicon.svg" alt="Timol" className="h-8 w-8 flex-shrink-0" />
            <CardTitle className="text-xl">{t("app.title")}</CardTitle>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{stepTitles[step - 1]}</span>
              <span>
                {t("app.step")} {step} {t("app.of")} {TOTAL_STEPS}
              </span>
            </div>
            <Progress value={(step / TOTAL_STEPS) * 100} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (step < TOTAL_STEPS) {
                handleNext();
              } else {
                handleSubmit();
              }
            }}
          >
            <div className="space-y-6">
              {step === 1 && <StepPersonal data={data} onChange={onChange} errors={errors} docCheckError={docCheckError} docBlocked={docBlocked} showDocCheck={showDocCheck} docChecking={docChecking} docCheckResult={docCheckResult} resetDocCheck={resetDocCheck} />}
              {step === 2 && <StepContact data={data} onChange={onChange} errors={errors} />}
              {step === 3 && <StepAddress data={data} onChange={onChange} errors={errors} />}
              {step === 4 && <StepLogin data={data} onChange={onChange} errors={errors} onUsernameStatusChange={setUsernameStatus} />}

              {apiError && <p className="text-sm text-destructive text-center">{apiError}</p>}

              <div className="flex justify-between gap-2">
                {step > 1 ? (
                  <Button type="button" variant="outline" onClick={handleBack} disabled={loading}>
                    {t("btn.back")}
                  </Button>
                ) : onBackToSponsor ? (
                  <Button type="button" variant="outline" onClick={onBackToSponsor} disabled={loading}>
                    {t("btn.back")}
                  </Button>
                ) : (
                  <div />
                )}

                {step < TOTAL_STEPS ? (
                  <Button type="submit" disabled={loading || (step === 1 && (docChecking || docBlocked || docNotValidated))}>
                    {(step === 1 && docChecking) && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    {t("btn.next")}
                  </Button>
                ) : (
                  <Button type="submit" disabled={loading || usernameStatus === "taken" || usernameStatus === "checking" || usernameStatus === "idle"}>
                    {t("btn.submit")}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Document check popup */}
      {showDocCheck && (
        <DocumentCheckPopup
          onClose={() => setShowDocCheck(false)}
        />
      )}

      {loading && (
        <FullScreenTimolLoader
          title={t("submit.loading.title")}
          hint={t("submit.loading.hint")}
          size={64}
        />
      )}
    </>
  );
};

// CPF validation
function validateCPF(cpf: string): boolean {
  const clean = cpf.replace(/\D/g, "");
  if (clean.length !== 11) return false;
  if (/^(\d)\1+$/.test(clean)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(clean[i]) * (10 - i);
  let r = (sum * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  if (r !== parseInt(clean[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(clean[i]) * (11 - i);
  r = (sum * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  return r === parseInt(clean[10]);
}
