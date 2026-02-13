import { LanguageProvider } from "@/i18n/LanguageContext";
import { RegistrationWizard } from "@/components/registration/RegistrationWizard";

const Index = () => {
  return (
    <LanguageProvider>
      <main className="flex min-h-screen items-center justify-center bg-background p-4">
        <RegistrationWizard />
      </main>
    </LanguageProvider>
  );
};

export default Index;
