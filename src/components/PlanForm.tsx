"use client";

import { useMemo, useState } from "react";
import { Button } from "./Button";
import { Input, Textarea } from "./Input";
import { Select } from "./Select";
import type { Plan, PlanStatus } from "@/lib/types";

export type PlanFormValues = {
  title: string;
  description: string;
  category: string;
  location: string;
  est_cost: string;
  when_text: string;
  priority: number;
  status: PlanStatus;
};

const categories = [
  "Viaje",
  "Concierto",
  "Casa rural",
  "Restaurante",
  "Experiencia",
  "Hobby",
  "Otro",
];

export function PlanForm({
  initial,
  onSubmit,
  onCancel,
  busy,
}: {
  initial?: Partial<Plan>;
  onSubmit: (values: PlanFormValues) => Promise<void> | void;
  onCancel: () => void;
  busy?: boolean;
}) {
  const defaults = useMemo<PlanFormValues>(() => {
    return {
      title: initial?.title ?? "",
      description: initial?.description ?? "",
      category: initial?.category ?? "Viaje",
      location: initial?.location ?? "",
      est_cost:
        initial?.est_cost === null || initial?.est_cost === undefined
          ? ""
          : String(initial.est_cost),
      when_text: initial?.when_text ?? "",
      priority: initial?.priority ?? 2,
      status: (initial?.status as PlanStatus) ?? "wishlist",
    };
  }, [initial]);

  const [values, setValues] = useState(defaults);

  const set = (k: keyof PlanFormValues, v: any) =>
    setValues((p) => ({ ...p, [k]: v }));

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!values.title.trim()) return;
        await onSubmit({
          ...values,
          title: values.title.trim(),
          description: values.description.trim(),
          location: values.location.trim(),
          when_text: values.when_text.trim(),
          category: values.category.trim(),
        });
      }}
    >
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-zinc-700">Plan</label>
        <Input
          placeholder="Ej: Fin de semana en una casa rural con chimenea"
          value={values.title}
          onChange={(e) => set("title", e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-zinc-700">Descripción</label>
        <Textarea
          placeholder="Notas, ideas, por qué mola, links…"
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-700">Categoría</label>
          <Select
            value={values.category}
            onChange={(e) => set("category", e.target.value)}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-700">Ubicación</label>
          <Input
            placeholder="Ej: Asturias / Madrid / Lisboa"
            value={values.location}
            onChange={(e) => set("location", e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-700">
            Presupuesto aprox.
          </label>
          <Input
            placeholder="Ej: 250"
            inputMode="decimal"
            value={values.est_cost}
            onChange={(e) => set("est_cost", e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-700">Cuándo</label>
          <Input
            placeholder="Ej: Primavera / cuando haya ofertas / 2026"
            value={values.when_text}
            onChange={(e) => set("when_text", e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-700">Prioridad</label>
          <Select
            value={String(values.priority)}
            onChange={(e) => set("priority", Number(e.target.value))}
          >
            <option value="1">1 (alta)</option>
            <option value="2">2</option>
            <option value="3">3 (baja)</option>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-700">Estado</label>
          <Select
            value={values.status}
            onChange={(e) => set("status", e.target.value as PlanStatus)}
          >
            <option value="wishlist">Wishlist</option>
            <option value="planned">Planificado</option>
            <option value="done">Hecho</option>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={busy || !values.title.trim()}>
          {busy ? "Guardando..." : "Guardar"}
        </Button>
      </div>
    </form>
  );
}
