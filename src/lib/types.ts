export type PlanStatus = "wishlist" | "planned" | "done";

export type Plan = {
  id: string;
  board_slug: string;
  title: string;
  description: string | null;
  category: string | null;
  location: string | null;
  est_cost: number | null;
  when_text: string | null;
  priority: number;
  status: PlanStatus;
  created_at: string;
};
