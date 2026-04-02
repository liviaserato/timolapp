import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { User, Check, X, Loader2, KeyRound, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  username: string;
  email: string;
  fullName: string;
}

export function CredentialsDialog({ open, onOpenChange, username, email, fullName }: Props) {
  const [editing, setEditing] = useState(false);
  const [newUsername, setNewUsername] = useState(username);
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [resetSending, setResetSending] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setEditing(false);
      setNewUsername(username);
      setAvailable(null);
      setChecking(false);
      setResetSent(false);
    }
  }, [open, username]);

  const usernameRegex = /^[a-z0-9._]*$/;

  const handleUsernameChange = (val: string) => {
    const clean = val.toLowerCase().slice(0, 20);
    if (!usernameRegex.test(clean)) return;
    setNewUsername(clean);
    setAvailable(null);

    if (clean === username || clean.length < 3) {
      setChecking(false);
      return;
    }

    clearTimeout(debounceRef.current);
    setChecking(true);
    debounceRef.current = setTimeout(() => {
      // Mock availability check
      const taken = ["admin", "timol", "sistema", "suporte"];
      const isAvailable = !taken.includes(clean);
      setAvailable(isAvailable);
      setChecking(false);
    }, 600);
  };

  const handleSaveUsername = () => {
    if (!available || newUsername === username) return;
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setEditing(false);
      toast.success("Nome de usuário atualizado com sucesso.");
    }, 1000);
  };

  const handleResetPassword = () => {
    setResetSending(true);
    setTimeout(() => {
      setResetSending(false);
      setResetSent(true);
      toast.success(`E-mail de redefinição enviado para ${email}`);
    }, 1500);
  };

  const maskedEmail = email.replace(/^(.{2})(.*)(@.*)$/, (_, a, b, c) => a + b.replace(/./g, "•") + c);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Usuário e Senha
          </DialogTitle>
          <DialogDescription className="space-y-0.5">
            <span>Gerencie as credenciais de acesso de</span>
            <br />
            <span className="font-semibold text-foreground">{fullName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Username section */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Nome de usuário</Label>
            {!editing ? (
              <div className="flex items-center justify-between gap-2 rounded-md border border-border p-2.5">
                <span className="text-sm font-medium">{username}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs px-2 gap-1"
                  onClick={() => { setEditing(true); setNewUsername(username); }}
                >
                  Editar
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    value={newUsername}
                    onChange={(e) => handleUsernameChange(e.target.value)}
                    placeholder="nome.usuario"
                    className="pr-8"
                    autoFocus
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2">
                    {checking && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                    {!checking && available === true && newUsername !== username && <Check className="h-4 w-4 text-emerald-500" />}
                    {!checking && available === false && <X className="h-4 w-4 text-destructive" />}
                  </span>
                </div>
                {!checking && available === false && (
                  <p className="text-xs text-destructive">Este nome de usuário já está em uso.</p>
                )}
                {!checking && available === true && newUsername !== username && (
                  <p className="text-xs text-emerald-600">Nome de usuário disponível!</p>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-8 text-xs"
                    onClick={() => { setEditing(false); setNewUsername(username); setAvailable(null); }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 h-8 text-xs"
                    disabled={!available || newUsername === username || saving}
                    onClick={handleSaveUsername}
                  >
                    {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Salvar"}
                  </Button>
                </div>
              </div>
            )}
          </div>


          {/* Password reset section */}
          <div className="space-y-3">
            {resetSent ? (
              <div className="flex flex-col items-center gap-3 py-3">
                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-sm font-medium">Um link de redefinição de senha foi enviado para</p>
                  <p className="text-sm font-medium text-muted-foreground">{maskedEmail}</p>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-1.5 h-8 text-xs"
                onClick={handleResetPassword}
                disabled={resetSending}
              >
                {resetSending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <KeyRound className="h-3.5 w-3.5" />
                )}
                {resetSending ? "Enviando..." : "Enviar e-mail de redefinição da senha"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
