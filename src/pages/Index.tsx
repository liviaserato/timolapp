import { useState, useEffect } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSearchParams, useNavigate } from "react-router-dom";
import { SponsorScreen } from "@/components/screens/SponsorScreen";
import { RegistrationWizard } from "@/components/registration/RegistrationWizard";
import { FranchiseScreen } from "@/components/screens/FranchiseScreen";
import { SummaryScreen } from "@/components/screens/SummaryScreen";
import { PaymentScreen } from "@/components/screens/PaymentScreen";
import { PaymentPendingScreen } from "@/components/screens/PaymentPendingScreen";
import { PaymentConfirmationScreen } from "@/components/screens/PaymentConfirmationScreen";
import { WelcomeBackPopup } from "@/components/screens/WelcomeBackPopup";
import { ContractScreen } from "@/components/screens/ContractScreen";
import { AppScreen, WizardData } from "@/types/wizard";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  useEffect(() => { document.title = "Cadastro Nova Franquia"; return () => { document.title = "Timol System"; }; }, []);
  const [screen, setScreen] = useState<AppScreen>("sponsor");
  const [wizardData, setWizardData] = useState<WizardData>({});
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isContractOpen = searchParams.get("contract") === "1";

  // Handle continue flow from recovery email
  useEffect(() => {
    const isContinue = searchParams.get("continue") === "1";
    if (!isContinue) return;

    const stored = sessionStorage.getItem("continueData");
    if (!stored) return;

    try {
      const data = JSON.parse(stored);
      sessionStorage.removeItem("continueData");

      setWizardData({
        fullName: data.fullName,
        email: data.email,
        document: data.document,
        phoneNumber: data.phoneNumber ?? data.phone,
        birthDate: data.birthDate,
        gender: data.gender,
        country: data.country,
        zipCode: data.zipCode,
        street: data.street,
        number: data.number,
        complement: data.complement,
        neighborhood: data.neighborhood,
        cityId: data.cityId ?? data.city,
        stateId: data.stateId ?? data.state,
        username: data.username,
        sponsorName: data.sponsorName,
        sponsorFranchiseId: data.sponsorFranchiseId ?? data.sponsorId,
        authUserId: data.authUserId,
        franchiseId: data.sponsorFranchiseId ?? data.sponsorId, // Display ID
      });

      setScreen("franchise");
      setShowWelcomeBack(true);
    } catch (e) {
      console.error("Failed to parse continue data:", e);
    }
  }, [searchParams]);

  const updateData = (patch: Partial<WizardData>) =>
    setWizardData((prev) => ({ ...prev, ...patch }));

  // Update registration_status when franchise/payment status changes
  const updateRegistrationStatus = async (fields: Record<string, unknown>) => {
    const authUserId = wizardData.authUserId;
    if (!authUserId) return;
    try {
      await supabase.functions.invoke("track-registration", {
        body: {
          mode: "update",
          user_id: authUserId,
          fields,
        },
      });
    } catch (e) {
      console.error("Failed to update registration status:", e);
    }
  };

  const handleCloseContract = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("contract");

    navigate(nextParams.toString() ? `/cadastro?${nextParams.toString()}` : "/cadastro", { replace: true });
  };

  const renderScreen = () => {
    switch (screen) {
      case "sponsor":
        return (
          <SponsorScreen
            onNext={(sponsorData) => {
              updateData(sponsorData);
              setScreen("registration");
            }}
          />
        );
      case "registration":
      case "registrationAddress":
        return (
          <RegistrationWizard
            initialData={wizardData}
            initialStep={screen === "registrationAddress" ? 3 : 1}
            onComplete={(data) => {
              updateData(data);
              setScreen("franchise");
            }}
            onBack={() => setScreen("sponsor")}
          />
        );
      case "franchise":
        return (
          <FranchiseScreen
            data={wizardData}
            onNext={(franchiseTypeCode, price) => {
              updateData({ franchiseTypeCode, franchisePrice: price });
              updateRegistrationStatus({ franchise_selected: true });
              setScreen("summary");
            }}
            onBack={() => setScreen("registration")}
          />
        );
      case "summary":
        return (
          <SummaryScreen
            data={wizardData}
            onConfirm={() => setScreen("payment")}
            onBack={() => setScreen("franchise")}
            onEditPersonal={() => setScreen("registration")}
            onEditAddress={() => setScreen("registrationAddress")}
            onChangeFranchise={() => setScreen("franchise")}
          />
        );
      case "payment":
        return (
          <PaymentScreen
            data={wizardData}
            onConfirm={(paymentInfo: Partial<WizardData>) => {
              updateData(paymentInfo);
              const method = paymentInfo.paymentMethod ?? "credit-card";
              if (method === "credit-card") {
                // Real Stripe result — registrationStatus set by PaymentScreen
                const confirmed = paymentInfo.registrationStatus === "payment_confirmed";
                if (confirmed) {
                  updateRegistrationStatus({ payment_completed: true, status: "completed" });
                  setScreen("paymentConfirmation");
                } else {
                  setScreen("paymentPending");
                }
              } else if (method === "pix" && wizardData.foreignerNoCpf !== "true") {
                setScreen("paymentPending");
              } else if (method === "deposit") {
                setScreen("paymentPending");
              } else {
                setScreen("paymentPending");
              }
            }}
            onBack={() => setScreen("summary")}
          />
        );
      case "paymentPending":
        return (
          <PaymentPendingScreen
            data={wizardData}
            onConfirmed={() => setScreen("paymentConfirmation")}
            onChangePayment={() => setScreen("payment")}
          />
        );
      case "paymentConfirmation":
        return <PaymentConfirmationScreen data={wizardData} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10">
      <main className="flex min-h-screen items-center justify-center p-4 sm:p-6">
        {renderScreen()}
      </main>

      {/* Welcome back popup for users returning from recovery email */}
      <WelcomeBackPopup
        open={showWelcomeBack}
        onClose={() => setShowWelcomeBack(false)}
      />

      {isContractOpen && <ContractScreen mode="modal" onClose={handleCloseContract} />}
    </div>
  );
};

export default Index;
