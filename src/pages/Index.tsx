import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { SponsorScreen } from "@/components/screens/SponsorScreen";
import { RegistrationWizard } from "@/components/registration/RegistrationWizard";
import { FranchiseScreen } from "@/components/screens/FranchiseScreen";
import { SummaryScreen } from "@/components/screens/SummaryScreen";
import { PaymentScreen } from "@/components/screens/PaymentScreen";
import { PaymentPendingScreen } from "@/components/screens/PaymentPendingScreen";
import { PaymentConfirmationScreen } from "@/components/screens/PaymentConfirmationScreen";
import { AppScreen, WizardData } from "@/types/wizard";

const Index = () => {
  const [screen, setScreen] = useState<AppScreen>("sponsor");
  const [wizardData, setWizardData] = useState<WizardData>({});

  const updateData = (patch: Partial<WizardData>) =>
    setWizardData((prev) => ({ ...prev, ...patch }));

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
              // Simulate: PIX always goes to pending, credit randomly
              const method = paymentInfo.paymentMethod ?? "credit";
              if (method === "pix" && wizardData.foreignerNoCpf !== "true") {
                setScreen("paymentPending");
              } else {
                // Test bypass: cardholder name "LIVIA" auto-approves
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
    </div>
  );
};

export default Index;