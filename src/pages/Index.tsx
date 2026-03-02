import { useState, useEffect } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSearchParams } from "react-router-dom";
import { SponsorScreen } from "@/components/screens/SponsorScreen";
import { RegistrationWizard } from "@/components/registration/RegistrationWizard";
import { FranchiseScreen } from "@/components/screens/FranchiseScreen";
import { SummaryScreen } from "@/components/screens/SummaryScreen";
import { PaymentScreen } from "@/components/screens/PaymentScreen";
import { PaymentPendingScreen } from "@/components/screens/PaymentPendingScreen";
import { PaymentConfirmationScreen } from "@/components/screens/PaymentConfirmationScreen";
import { WelcomeBackPopup } from "@/components/screens/WelcomeBackPopup";
import { AppScreen, WizardData } from "@/types/wizard";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  useEffect(() => { document.title = "Cadastro Nova Franquia"; return () => { document.title = "Timol System"; }; }, []);
  const [screen, setScreen] = useState<AppScreen>("sponsor");
  const [wizardData, setWizardData] = useState<WizardData>({});
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [searchParams] = useSearchParams();

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
        phone: data.phone,
        birthDate: data.birthDate,
        gender: data.gender,
        country: data.country,
        zipCode: data.zipCode,
        street: data.street,
        number: data.number,
        complement: data.complement,
        neighborhood: data.neighborhood,
        city: data.city,
        state: data.state,
        username: data.username,
        sponsorName: data.sponsorName,
        sponsorId: data.sponsorId,
        authUserId: data.authUserId,
        userId: data.sponsorId, // Display ID
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
          />
        );
      case "franchise":
        return (
          <FranchiseScreen
            data={wizardData}
            onNext={(franchise, price) => {
              updateData({ franchise, franchisePrice: price });
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
              updateRegistrationStatus({ payment_completed: true, status: "completed" });
              const method = paymentInfo.paymentMethod ?? "credit";
              if (method === "pix" && wizardData.foreignerNoCpf !== "true") {
                setScreen("paymentPending");
              } else {
                const isTestApproved = paymentInfo.cardHolderName?.toUpperCase() === "LIVIA";
                const approved = isTestApproved || Math.random() > 0.5;
                setScreen(approved ? "paymentConfirmation" : "paymentPending");
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
    </div>
  );
};

export default Index;
