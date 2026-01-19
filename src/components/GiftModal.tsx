"use client";

import { useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/Button";
import { Gift, Plane, Sparkles } from "lucide-react";

type Step = "teaser" | "tickets";

function safeText(v: string | undefined | null) {
  return (v ?? "").trim();
}

export function GiftModal({
  open,
  onClose,
  title,
  imagePath,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  imagePath: string; // ej: "/tickets-itxi.png"
}) {
  const [step, setStep] = useState<Step>("teaser");
  const [busy, setBusy] = useState(false);

  const modalTitle = useMemo(() => safeText(title) || "Tu regalo", [title]);

  useEffect(() => {
    if (!open) setStep("teaser");
  }, [open]);

  async function fireConfetti() {
    try {
      // Tipado robusto: evitamos problemas de default export / tipos
      const mod: any = await import("canvas-confetti");
      const confetti: any = mod?.default ?? mod;

      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.65 },
      });

      confetti({
        particleCount: 80,
        spread: 100,
        origin: { y: 0.6 },
        scalar: 0.9,
      });
    } catch {
      // no-op
    }
  }

  async function openTickets() {
    setBusy(true);
    await new Promise((r) => setTimeout(r, 220));
    setStep("tickets");
    await new Promise((r) => setTimeout(r, 80));
    await fireConfetti();
    setBusy(false);
  }

  return (
    <Modal open={open} title={modalTitle} onClose={onClose}>
      {step === "teaser" ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-zinc-200 bg-gradient-to-b from-white to-zinc-50 p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-900 text-white">
                <Gift className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <div className="text-base font-semibold">Hay un regalo esperándote</div>
                <div className="text-sm text-zinc-600">
                  Te quiero.
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2 text-sm">
              <div className="flex items-center gap-2 rounded-xl bg-white/80 border border-zinc-200 p-3">
                <Plane className="h-4 w-4 text-zinc-700" />
                <span className="text-zinc-800">Por muchos de estos más juntos.</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-white/80 border border-zinc-200 p-3">
                <Sparkles className="h-4 w-4 text-zinc-700" />
                <span className="text-zinc-800">Este regalo se queda guardado aquí. Felices 38 mi amoL.</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
            <Button variant="secondary" onClick={onClose}>
              Cerrar
            </Button>
            <Button onClick={openTickets} disabled={busy}>
              {busy ? "Abriendo..." : "Abrir regalo"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-sm text-zinc-600">Aquí están. Cuando quieras, lo hacemos real.</div>

          <div className="rounded-2xl border border-zinc-200 overflow-hidden bg-white shadow-sm">
            <img
              src={imagePath}
              alt="Tickets de avión"
              className="w-full h-auto block"
              loading="eager"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
            <a
              href={imagePath}
              download
              className="inline-flex items-center justify-center rounded-xl font-medium transition h-10 px-4 text-sm bg-zinc-900 text-white hover:bg-zinc-800"
            >
              Descargar imagen
            </a>
            <Button variant="secondary" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
