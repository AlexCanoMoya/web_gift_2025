"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Button } from "./Button";

export function Modal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    // Evita que el body se mueva detrás del modal en móvil
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={cn(
          "relative w-full max-w-lg rounded-2xl bg-white shadow-xl border border-zinc-200",
          // Clave: limitar altura total del modal para que quepa en móvil
          "max-h-[calc(100vh-2rem)] overflow-hidden"
        )}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
          <div className="text-sm font-semibold">{title}</div>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Cerrar">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Clave: el contenido hace scroll */}
        <div className="p-5 overflow-y-auto max-h-[calc(100vh-2rem-57px)]">
          {children}
        </div>
      </div>
    </div>
  );
}
