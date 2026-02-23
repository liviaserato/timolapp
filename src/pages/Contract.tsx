import { useSearchParams } from "react-router-dom";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { ContractScreen } from "@/components/screens/ContractScreen";
import { WizardData } from "@/types/wizard";

const ContractPage = () => {
  const [params] = useSearchParams();

  // Hydrate wizard data from URL search params
  const data: WizardData = {
    userId: params.get("userId") ?? undefined,
    fullName: params.get("fullName") ?? undefined,
    document: params.get("document") ?? undefined,
    email: params.get("email") ?? undefined,
    street: params.get("street") ?? undefined,
    number: params.get("number") ?? undefined,
    complement: params.get("complement") ?? undefined,
    neighborhood: params.get("neighborhood") ?? undefined,
    city: params.get("city") ?? undefined,
    state: params.get("state") ?? undefined,
    zipCode: params.get("zipCode") ?? undefined,
    country: params.get("country") ?? undefined,
    countryIso2: params.get("countryIso2") ?? undefined,
    franchise: params.get("franchise") ?? undefined,
    sponsorName: params.get("sponsorName") ?? undefined,
    sponsorId: params.get("sponsorId") ?? undefined,
  };

  return <ContractScreen data={data} />;
};

export default ContractPage;
