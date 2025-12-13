"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Plan, PlanStatus } from "@/lib/types";
import { Button } from "./Button";
import { Input } from "./Input";
import { Badge } from "./Badge";
import { Modal } from "./Modal";
import { PlanForm, PlanFormValues } from "./PlanForm";
import {
  Plus,
  Search,
  Trash2,
  Pencil,
  CheckCircle2,
  CalendarClock,
} from "lucide-react";

const boardTitle = process.env.NEXT_PUBLIC_BOARD_TITLE ?? "Plans Board";
const boardSlug = process.env.NEXT_PUBLIC_BOARD_SLUG ?? "default-board";

// Imagen de fondo por deploy (ej: /bg-itxi.jpg o /bg-canos.jpg)
const bgImage = process.env.NEXT_PUBLIC_BG_IMAGE ?? "";

// (Opcional) para ajustar encuadre sin tocar código:
// ej: "center", "top", "50% 30%", "center 20%"
const bgPosition = process.env.NEXT_PUBLIC_BG_POSITION ?? "center";

// Overlay (más alto = más blanco, más legibilidad; más bajo = se ve más la foto)
const overlayAlpha = Number(process.env.NEXT_PUBLIC_BG_OVERLAY ?? "0.86");

function formatCost(n: number | null) {
  if (n === null || n === undefined) return "—";
  try {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(Number(n));
  } catch {
    return `${n} €`;
  }
}

function statusLabel(s: PlanStatus) {
  if (s === "wishlist") return "Wishlist";
  if (s === "planned") return "Planificado";
  return "Hecho";
}

export function Board() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<PlanStatus | "all">("all");
  const [openNew, setOpenNew] = useState(false);
  const [edit, setEdit] = useState<Plan | null>(null);
  const [busy, setBusy] = useState(false);

  async function fetchPlans() {
    setLoading(true);
    const { data, error } = await supabase
      .from("plans")
      .select("*")
      .eq("board_slug", boardSlug)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setPlans([]);
    } else {
      setPlans((data ?? []) as Plan[]);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchPlans();

    const channel = supabase
      .channel("plans-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "plans" },
        () => {
          // Sencillo y robusto: refetch ante cualquier cambio.
          fetchPlans();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return plans.filter((p) => {
      const matchesText =
        !needle ||
        p.title.toLowerCase().includes(needle) ||
        (p.description ?? "").toLowerCase().includes(needle) ||
        (p.location ?? "").toLowerCase().includes(needle) ||
        (p.category ?? "").toLowerCase().includes(needle);

      const matchesStatus = status === "all" ? true : p.status === status;
      return matchesText && matchesStatus;
    });
  }, [plans, q, status]);

  const counts = useMemo(() => {
    const c = { all: plans.length, wishlist: 0, planned: 0, done: 0 };
    for (const p of plans) c[p.status] += 1;
    return c;
  }, [plans]);

  async function createPlan(values: PlanFormValues) {
    setBusy(true);
    const est = values.est_cost.trim() ? Number(values.est_cost) : null;

    const { error } = await supabase.from("plans").insert({
      board_slug: boardSlug,
      title: values.title,
      description: values.description || null,
      category: values.category || null,
      location: values.location || null,
      when_text: values.when_text || null,
      est_cost: Number.isFinite(est as any) ? est : null,
      priority: values.priority,
      status: values.status,
    });

    setBusy(false);

    if (error) {
      console.error(error);
      alert(`Error al guardar: ${error.message}`);
      return;
    }
    
    setOpenNew(false);
  }

  async function updatePlan(values: PlanFormValues) {
    if (!edit) return;

    setBusy(true);
    const est = values.est_cost.trim() ? Number(values.est_cost) : null;

    const { error } = await supabase
      .from("plans")
      .update({
        title: values.title,
        description: values.description || null,
        category: values.category || null,
        location: values.location || null,
        when_text: values.when_text || null,
        est_cost: Number.isFinite(est as any) ? est : null,
        priority: values.priority,
        status: values.status,
      })
      .eq("id", edit.id);

    setBusy(false);

    if (error) {
      console.error(error);
      alert("No se pudo actualizar. Revisa consola.");
      return;
    }

    setEdit(null);
  }

  async function removePlan(id: string) {
    if (!confirm("¿Eliminar este plan?")) return;

    const { error } = await supabase.from("plans").delete().eq("id", id);

    if (error) {
      console.error(error);
      alert("No se pudo eliminar. Revisa consola.");
    }
  }

  async function quickStatus(p: Plan, s: PlanStatus) {
    const { error } = await supabase
      .from("plans")
      .update({ status: s })
      .eq("id", p.id);

    if (error) {
      console.error(error);
      alert("No se pudo cambiar el estado.");
    }
  }

  const alpha = Number.isFinite(overlayAlpha) ? overlayAlpha : 0.86;
  const overlay = `linear-gradient(rgba(250,250,250,${alpha}), rgba(250,250,250,${alpha}))`;

  return (
    <div
      className="min-h-screen bg-cover bg-no-repeat"
      style={
        bgImage
          ? {
              backgroundImage: `${overlay}, url(${bgImage})`,
              backgroundPosition: bgPosition,
              // En desktop queda bonito, en móvil puede ir mal; por eso lo dejamos en "scroll".
              backgroundAttachment: "scroll",
            }
          : undefined
      }
    >
      <div className="mx-auto max-w-5xl px-4 py-10">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <div className="text-xs font-medium text-zinc-500">Tablón de planes</div>
            <h1 className="text-3xl font-semibold tracking-tight">{boardTitle}</h1>
            <p className="text-sm text-zinc-600 max-w-xl">
              Wishlist de ideas y planes futuros. Sin fechas fijas: solo ilusión y dirección.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={() => setOpenNew(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Añadir plan
            </Button>
          </div>
        </header>

        <section className="mt-6 rounded-2xl border border-zinc-200/70 bg-white/80 backdrop-blur-md shadow-sm">
          <div className="p-4 border-b border-zinc-100 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 w-full sm:max-w-md">
              <div className="relative w-full">
                <Search className="h-4 w-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  className="pl-9"
                  placeholder="Buscar (viaje, ciudad, concierto...)"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <FilterPill
                label={`Todos (${counts.all})`}
                active={status === "all"}
                onClick={() => setStatus("all")}
              />
              <FilterPill
                label={`Wishlist (${counts.wishlist})`}
                active={status === "wishlist"}
                onClick={() => setStatus("wishlist")}
              />
              <FilterPill
                label={`Planificado (${counts.planned})`}
                active={status === "planned"}
                onClick={() => setStatus("planned")}
              />
              <FilterPill
                label={`Hecho (${counts.done})`}
                active={status === "done"}
                onClick={() => setStatus("done")}
              />
            </div>
          </div>

          <div className="p-4">
            {loading ? (
              <div className="text-sm text-zinc-600">Cargando...</div>
            ) : filtered.length === 0 ? (
              <EmptyState onAdd={() => setOpenNew(true)} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filtered.map((p) => (
                  <article
                    key={p.id}
                    className="rounded-2xl border border-zinc-200/70 bg-white/85 backdrop-blur-sm p-4 hover:shadow-sm transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="font-semibold leading-snug">{p.title}</h2>
                          <Badge variant="outline">{statusLabel(p.status)}</Badge>
                          {p.category ? (
                            <Badge variant="soft">{p.category}</Badge>
                          ) : null}
                        </div>
                        {p.description ? (
                          <p className="text-sm text-zinc-600 whitespace-pre-wrap">
                            {p.description}
                          </p>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEdit(p)}
                          aria-label="Editar"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removePlan(p.id)}
                          aria-label="Eliminar"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-700">
                      <Meta
                        icon={<CalendarClock className="h-4 w-4" />}
                        text={p.when_text || "Sin fecha"}
                      />
                      <Meta text={p.location || "Sin ubicación"} />
                      <Meta text={`Presupuesto: ${formatCost(p.est_cost)}`} />
                      <Meta text={`Prioridad: ${p.priority}`} />
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        variant={p.status === "wishlist" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => quickStatus(p, "wishlist")}
                      >
                        Wishlist
                      </Button>
                      <Button
                        variant={p.status === "planned" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => quickStatus(p, "planned")}
                      >
                        Planificar
                      </Button>
                      <Button
                        variant={p.status === "done" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => quickStatus(p, "done")}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Hecho
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <footer className="mt-6 text-xs text-zinc-500">
          Consejo: añade links en la descripción (Airbnb, entradas, rutas, etc.). Este tablón guarda cambios en tiempo real.
        </footer>
      </div>

      <Modal open={openNew} title="Añadir plan" onClose={() => setOpenNew(false)}>
        <PlanForm busy={busy} onCancel={() => setOpenNew(false)} onSubmit={createPlan} />
      </Modal>

      <Modal open={!!edit} title="Editar plan" onClose={() => setEdit(null)}>
        <PlanForm
          initial={edit ?? undefined}
          busy={busy}
          onCancel={() => setEdit(null)}
          onSubmit={updatePlan}
        />
      </Modal>
    </div>
  );
}

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "h-9 px-3 rounded-full text-sm border transition",
        active
          ? "bg-zinc-900 text-white border-zinc-900"
          : "bg-white/80 backdrop-blur text-zinc-800 border-zinc-200 hover:bg-zinc-50",
      ].join(" ")}
      type="button"
    >
      {label}
    </button>
  );
}

function Meta({ icon, text }: { icon?: React.ReactNode; text: string }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-zinc-100/90 px-2.5 py-1">
      {icon}
      <span>{text}</span>
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14">
      <div className="text-sm font-medium">Todavía no hay planes</div>
      <div className="mt-1 text-sm text-zinc-600 max-w-md">
        Crea el primero y úsalo como “tablón de futuro”: viajes, conciertos,
        escapadas, caprichos.
      </div>
      <div className="mt-4">
        <Button onClick={onAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Añadir plan
        </Button>
      </div>
    </div>
  );
}
