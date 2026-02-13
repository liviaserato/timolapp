import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StepPersonal } from "./StepPersonal";
import { StepContact } from "./StepContact";
import { StepAddress } from "./StepAddress";
import { StepLogin } from "./StepLogin";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, Loader2 } from "lucide-react";

const TOTAL_STEPS = 4;

export const RegistrationWizard = () => {
  const { t, language } = useLanguage();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState("");

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
      if (!data.birthDate) newErrors.birthDate = req;
      if (!data.document?.trim()) newErrors.document = req;
      if (!data.gender) newErrors.gender = req;
    } else if (step === 2) {
      if (!data.email?.trim()) newErrors.email = req;
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) newErrors.email = t("validation.email");
      if (!data.phone?.trim()) newErrors.phone = req;
    } else if (step === 3) {
      if (!data.zipCode?.trim()) newErrors.zipCode = req;
      if (!data.street?.trim()) newErrors.street = req;
      if (!data.number?.trim()) newErrors.number = req;
      if (!data.city?.trim()) newErrors.city = req;
      if (!data.state?.trim()) newErrors.state = req;
      if (!data.country?.trim()) newErrors.country = req;
    } else if (step === 4) {
      if (!data.username?.trim()) newErrors.username = req;
      if (!data.password) newErrors.password = req;
      else if (data.password.length < 6) newErrors.password = t("validation.passwordMin");
      if (!data.confirmPassword) newErrors.confirmPassword = req;
      else if (data.password !== data.confirmPassword)
        newErrors.confirmPassword = t("validation.passwordMatch");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };

  const handleBack = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setLoading(true);
    setApiError("");

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: data.email.trim(),
        password: data.password,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (signUpError) throw signUpError;

      // Get the new user session to update profile
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;

      if (userId) {
        await supabase.from("profiles").update({
          full_name: data.fullName?.trim(),
          birth_date: data.birthDate || null,
          document: data.document?.trim(),
          gender: data.gender,
          phone: data.phone?.trim(),
          zip_code: data.zipCode?.trim(),
          street: data.street?.trim(),
          number: data.number?.trim(),
          complement: data.complement?.trim() || null,
          neighborhood: data.neighborhood?.trim() || null,
          city: data.city?.trim(),
          state: data.state?.trim(),
          country: data.country?.trim(),
          username: data.username?.trim(),
          preferred_language: language,
        }).eq("user_id", userId);
      }

      setSuccess(true);
    } catch (err: any) {
      setApiError(err?.message || t("error.generic"));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardContent className="flex flex-col items-center gap-4 py-12">
          <CheckCircle2 className="h-16 w-16 text-green-500" />
          <h2 className="text-2xl font-bold">{t("success.title")}</h2>
          <p className="text-muted-foreground text-center">{t("success.message")}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            {t("success.back")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const stepTitles = [
    t("step1.title"),
    t("step2.title"),
    t("step3.title"),
    t("step4.title"),
  ];

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{t("app.title")}</CardTitle>
          <LanguageSelector />
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
        {step === 1 && <StepPersonal data={data} onChange={onChange} errors={errors} />}
        {step === 2 && <StepContact data={data} onChange={onChange} errors={errors} />}
        {step === 3 && <StepAddress data={data} onChange={onChange} errors={errors} />}
        {step === 4 && <StepLogin data={data} onChange={onChange} errors={errors} />}

        {apiError && <p className="text-sm text-destructive text-center">{apiError}</p>}

        <div className="flex justify-between gap-2">
          {step > 1 ? (
            <Button variant="outline" onClick={handleBack} disabled={loading}>
              {t("btn.back")}
            </Button>
          ) : (
            <div />
          )}

          {step < TOTAL_STEPS ? (
            <Button onClick={handleNext}>{t("btn.next")}</Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {t("btn.submit")}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
