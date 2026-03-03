import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import timolLogoDark from "@/assets/logo-timol-azul-escuro.svg";

interface Props {
  open: boolean;
  onClose: () => void;
}

export const ResumeRegistrationPopup = ({ open, onClose }: Props) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [userId, setUserId] = useState("");
  const [document, setDocument] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const resetForm = () => {
    setUserId("");
    setDocument("");
    setBirthDate("");
    setError("");
    setLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Format birth date input as DD/MM/YYYY
  const handleBirthDateChange = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 8);
    let formatted = digits;
    if (digits.length > 2) formatted = digits.slice(0, 2) + "/" + digits.slice(2);
    if (digits.length > 4) formatted = digits.slice(0, 2) + "/" + digits.slice(2, 4) + "/" + digits.slice(4);
    setBirthDate(formatted);
    setError("");
  };

  // Format document as CPF mask if 11 digits
  const handleDocumentChange = (val: string) => {
    const stripped = val.replace(/[^\d]/g, "");
    if (stripped.length <= 11) {
      // CPF mask
      let masked = stripped;
      if (stripped.length > 3) masked = stripped.slice(0, 3) + "." + stripped.slice(3);
      if (stripped.length > 6) masked = stripped.slice(0, 3) + "." + stripped.slice(3, 6) + "." + stripped.slice(6);
      if (stripped.length > 9) masked = stripped.slice(0, 3) + "." + stripped.slice(3, 6) + "." + stripped.slice(6, 9) + "-" + stripped.slice(9);
      setDocument(masked);
    } else {
      setDocument(val.slice(0, 20));
    }
    setError("");
  };

  const handleSubmit = async () => {
    // Basic validations
    if (!userId.trim()) {
      setError(t("resume.error.idRequired"));
      return;
    }
    if (!document.trim()) {
      setError(t("resume.error.documentRequired"));
      return;
    }
    if (!birthDate || birthDate.length < 10) {
      setError(t("resume.error.birthDateRequired"));
      return;
    }

    // Parse DD/MM/YYYY → YYYY-MM-DD
    const parts = birthDate.split("/");
    const isoDate = `${parts[2]}-${parts[1]}-${parts[0]}`;

    // Strip document formatting
    const rawDoc = document.replace(/[^\dA-Za-z]/g, "");

    setLoading(true);
    setError("");

    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        "resume-registration",
        {
          body: {
            franchise_id: userId.trim(),
            document: rawDoc,
            birth_date: isoDate,
          },
        }
      );

      if (fnError || !data?.success) {
        const errKey = data?.error;
        if (errKey === "already_completed") {
          setError(t("resume.error.alreadyCompleted"));
        } else if (errKey === "validation_failed") {
          setError(t("resume.error.validationFailed"));
        } else if (errKey === "not_found") {
          setError(t("resume.error.notFound"));
        } else {
          setError(data?.error || t("resume.error.notFound"));
        }
        setLoading(false);
        return;
      }

      // Store wizard data in sessionStorage for Index to pick up (same as email recovery)
      sessionStorage.setItem("continueData", JSON.stringify(data.data));
      handleClose();
      navigate("/?continue=1", { replace: true });
    } catch {
      setError(t("resume.error.generic"));
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader className="items-center space-y-2">
          <img src={timolLogoDark} alt="Timol" className="h-8 mx-auto" />
          <DialogTitle className="text-base">{t("resume.title")}</DialogTitle>
          <DialogDescription className="text-xs text-center">
            {t("resume.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          {/* User ID */}
          <div className="space-y-1.5">
            <Label htmlFor="resume-id" className="text-xs">{t("resume.userId")}</Label>
            <Input
              id="resume-id"
              placeholder={t("resume.userId.placeholder")}
              value={userId}
              onChange={(e) => {
                setUserId(e.target.value.replace(/\D/g, ""));
                setError("");
              }}
              maxLength={20}
              inputMode="numeric"
            />
          </div>

          {/* Document */}
          <div className="space-y-1.5">
            <Label htmlFor="resume-doc" className="text-xs">{t("resume.document")}</Label>
            <Input
              id="resume-doc"
              placeholder={t("resume.document.placeholder")}
              value={document}
              onChange={(e) => handleDocumentChange(e.target.value)}
              maxLength={20}
            />
          </div>

          {/* Birth date */}
          <div className="space-y-1.5">
            <Label htmlFor="resume-birth" className="text-xs">{t("resume.birthDate")}</Label>
            <Input
              id="resume-birth"
              placeholder="DD/MM/AAAA"
              value={birthDate}
              onChange={(e) => handleBirthDateChange(e.target.value)}
              maxLength={10}
              inputMode="numeric"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-xs text-destructive">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
          <Button
            className="w-full gap-2 mt-1"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("resume.submit")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
