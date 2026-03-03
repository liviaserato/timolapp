import timolLogoBranco from "@/assets/logo-timol-branco.svg";

export function AppInstitutionalFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto pt-10 pb-4 px-4">
      <div className="mx-auto max-w-[900px] flex flex-col items-center gap-3 border-t border-border/40 pt-4">
        <img
          src={timolLogoBranco}
          alt="Timol"
          className="h-6 w-auto object-contain opacity-40"
        />
        <p className="text-[11px] text-muted-foreground/60 text-center leading-relaxed">
          © {year} Timol — Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
