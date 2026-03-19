import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { InviteRequest } from "@/components/app/rede/InviteRequestCard";

interface ClosingRecord {
  id: string;
  sponsorId: string;
  sponsorName: string;
  guestDisplay: string;
  guestSub: string;
  date: string;
  franchiseType: string;
  confirmed: boolean | null;
}

const initialInvites: InviteRequest[] = [
  { id: "inv-1", sponsorId: "TML-6102", sponsorName: "Luciana Braga", sponsorPhone: "+55 11 98765-4321", requestedAt: "2026-03-18" },
  { id: "inv-2", sponsorId: "TML-7744", sponsorName: "Eduardo Martins", sponsorPhone: "+55 21 91234-5678", requestedAt: "2026-03-19" },
];

interface InviteContextValue {
  invites: InviteRequest[];
  handleAcceptInvite: (invite: InviteRequest, link: string) => void;
  handleRejectInvite: (inviteId: string) => void;
  closingRecordsFromInvites: ClosingRecord[];
}

const InviteContext = createContext<InviteContextValue | null>(null);

export function InviteProvider({ children }: { children: ReactNode }) {
  const [invites, setInvites] = useState<InviteRequest[]>(initialInvites);
  const [closingRecordsFromInvites, setClosingRecords] = useState<ClosingRecord[]>([]);

  const handleAcceptInvite = useCallback((invite: InviteRequest, link: string) => {
    setInvites((prev) => prev.filter((i) => i.id !== invite.id));
    const now = new Date();
    const newRecord: ClosingRecord = {
      id: `accepted-${invite.id}`,
      sponsorId: invite.sponsorId,
      sponsorName: invite.sponsorName,
      guestDisplay: link,
      guestSub: "Aguardando cadastro",
      date: now.toISOString().split("T")[0],
      franchiseType: "—",
      confirmed: null,
    };
    setClosingRecords((prev) => [newRecord, ...prev]);
  }, []);

  const handleRejectInvite = useCallback((inviteId: string) => {
    setInvites((prev) => prev.filter((i) => i.id !== inviteId));
  }, []);

  return (
    <InviteContext.Provider value={{ invites, handleAcceptInvite, handleRejectInvite, closingRecordsFromInvites }}>
      {children}
    </InviteContext.Provider>
  );
}

export function useInvites() {
  const ctx = useContext(InviteContext);
  if (!ctx) throw new Error("useInvites must be used within InviteProvider");
  return ctx;
}
