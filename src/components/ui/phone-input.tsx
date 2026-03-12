import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { countries, type Country } from "@/data/countries";
import { ChevronDown, Search } from "lucide-react";

interface PhoneInputProps {
  /** ISO2 country code for DDI, e.g. "BR" */
  countryIso2: string;
  /** Phone number without DDI */
  number: string;
  onCountryChange: (iso2: string) => void;
  onNumberChange: (number: string) => void;
  /** Placeholder for number field */
  placeholder?: string;
  /** Max length for number field */
  maxLength?: number;
  disabled?: boolean;
  hasError?: boolean;
}

export function PhoneInput({
  countryIso2,
  number,
  onCountryChange,
  onNumberChange,
  placeholder = "11 99999-0000",
  maxLength = 15,
  disabled = false,
  hasError = false,
}: PhoneInputProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = countries.find((c) => c.iso2 === countryIso2) ?? countries.find((c) => c.iso2 === "BR")!;

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Focus search when opened
  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  const filtered = search.trim()
    ? countries.filter((c) => {
        const q = search.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.nameEn.toLowerCase().includes(q) ||
          c.dialCode.includes(q) ||
          c.iso2.toLowerCase().includes(q)
        );
      })
    : countries;

  const handleSelect = (c: Country) => {
    onCountryChange(c.iso2);
    setOpen(false);
    setSearch("");
  };

  return (
    <div ref={containerRef} className="relative flex gap-1.5">
      {/* DDI Selector */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-1 shrink-0 h-10 px-2 rounded-md border bg-background text-sm",
          "hover:bg-accent/50 transition-colors",
          hasError ? "border-destructive" : "border-input",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <span className="text-base leading-none">{selected.flag}</span>
        <span className="text-muted-foreground text-xs">{selected.dialCode}</span>
        <ChevronDown className="h-3 w-3 text-muted-foreground" />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 w-64 bg-popover border border-border rounded-lg shadow-lg">
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar país..."
                className="w-full h-8 pl-7 pr-2 text-sm bg-background border border-input rounded-md outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground p-3 text-center">Nenhum país encontrado</p>
            ) : (
              filtered.map((c) => (
                <button
                  key={c.iso2}
                  type="button"
                  onClick={() => handleSelect(c)}
                  className={cn(
                    "flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-accent/50 transition-colors",
                    c.iso2 === selected.iso2 && "bg-accent/30 font-medium"
                  )}
                >
                  <span className="text-base leading-none">{c.flag}</span>
                  <span className="truncate flex-1">{c.name}</span>
                  <span className="text-muted-foreground text-xs shrink-0">{c.dialCode}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Number Input */}
      <Input
        value={number}
        onChange={(e) => {
          const val = e.target.value.replace(/[^\d\s()-]/g, "");
          onNumberChange(val);
        }}
        placeholder={placeholder}
        inputMode="tel"
        maxLength={maxLength}
        disabled={disabled}
        className={cn("flex-1", hasError && "border-destructive")}
      />
    </div>
  );
}
