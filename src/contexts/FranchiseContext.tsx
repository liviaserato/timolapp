import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface FranchiseProfile {
  franchiseId: string;
  name: string;
  planCode?: string;
}

interface FranchiseContextType {
  profiles: FranchiseProfile[];
  selected: FranchiseProfile | null;
  setSelectedId: (franchiseId: string) => void;
  hasMultiple: boolean;
  addProfile: (profile: FranchiseProfile) => void;
}

const FranchiseContext = createContext<FranchiseContextType>({
  profiles: [],
  selected: null,
  setSelectedId: () => {},
  hasMultiple: false,
  addProfile: () => {},
});

export function useFranchise() {
  return useContext(FranchiseContext);
}

// Mock data — will be replaced with real DB query later
const MOCK_PROFILES: FranchiseProfile[] = [
  { franchiseId: "100231", name: "Lívia Serato", planCode: "gold" },
  { franchiseId: "200587", name: "Lívia Serato - Unidade 2", planCode: "silver" },
  { franchiseId: "300142", name: "Lívia Serato - Unidade 3", planCode: "bronze" },
];

export function FranchiseProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<FranchiseProfile[]>(MOCK_PROFILES);
  const [selectedId, setSelectedId] = useState<string>(MOCK_PROFILES[0]?.franchiseId ?? "");

  const selected = profiles.find((p) => p.franchiseId === selectedId) ?? profiles[0] ?? null;
  const hasMultiple = profiles.length > 1;

  const addProfile = useCallback((profile: FranchiseProfile) => {
    setProfiles((prev) => {
      if (prev.some((p) => p.franchiseId === profile.franchiseId)) return prev;
      return [...prev, profile];
    });
  }, []);

  return (
    <FranchiseContext.Provider value={{ profiles, selected, setSelectedId, hasMultiple, addProfile }}>
      {children}
    </FranchiseContext.Provider>
  );
}
