import { useState } from "react";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { SponsorScreen } from "@/components/screens/SponsorScreen";
import { RegistrationWizard } from "@/components/registration/RegistrationWizard";
import { FranchiseScreen } from "@/components/screens/FranchiseScreen";
import { SummaryScreen } from "@/components/screens/SummaryScreen";
import { PaymentScreen } from "@/components/screens/PaymentScreen";
import { PaymentConfirmationScreen } from "@/components/screens/PaymentConfirmationScreen";
import { AppScreen, WizardData } from "@/types/wizard";
import timolLogo from "@/assets/timol-logo.svg";

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
        return (
          <RegistrationWizard
            initialData={wizardData}
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
          />
        );
      case "payment":
        return (
          <PaymentScreen
            data={wizardData}
            onConfirm={() => setScreen("paymentConfirmation")}
            onBack={() => setScreen("summary")}
          />
        );
      case "paymentConfirmation":
        return <PaymentConfirmationScreen data={wizardData} />;
    }
  };

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center gap-2 px-4">
            <img src={timolLogo} alt="Timol" className="h-8 w-8" />
            <span className="font-bold text-primary tracking-wide text-lg">TIMOL</span>
          </div>
        </header>
        <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-4 sm:p-6">
          {renderScreen()}
        </main>
      </div>
    </LanguageProvider>
  );
};

export default Index;
