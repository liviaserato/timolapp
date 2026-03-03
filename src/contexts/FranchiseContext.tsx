import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface FranchiseProfile {
  franchiseId: string;
  name: string;
}

interface FranchiseContextType {
  profiles: FranchiseProfile[];
  selected: FranchiseProfile | null;
  setSelectedId: (franchiseId: string) => void;
  hasMultiple: boolean;
}

const FranchiseContext = createContext<FranchiseContextType>({
  profiles: [],
  selected: null,
  setSelectedId: () => {},
  hasMultiple: false,
});

export function useFranchise() {
  return useContext(FranchiseContext);
}

// Mock data — will be replaced with real DB query later
const MOCK_PROFILES: FranchiseProfile[] = [
  { franchiseId: "100231", name: "Lívia Serato" },
  { franchiseId: "200587", name: "Lívia Serato - Unidade 2" },
  { franchiseId: "300142", name: "Lívia Serato - Unidade 3" },
];

export function FranchiseProvider({ children }: { children: ReactNode }) {
  const [profiles] = useState<FranchiseProfile[]>(MOCK_PROFILES);
  const [selectedId, setSelectedId] = useState<string>(MOCK_PROFILES[0]?.franchiseId ?? "");

  const selected = profiles.find((p) => p.franchiseId === selectedId) ?? profiles[0] ?? null;
  const hasMultiple = profiles.length > 1;

  return (
    <FranchiseContext.Provider value={{ profiles, selected, setSelectedId, hasMultiple }}>
      {children}
    </FranchiseContext.Provider>
  );
}
