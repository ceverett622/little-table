import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DAYS, ageLabel, parseList, type Child } from "@/lib/diet";

export const Route = createFileRoute("/_authenticated/children")({
  head: () => ({
    meta: [
      { title: "Child profiles — Little Table" },
      {
        name: "description",
        content:
          "Track allergies, dietary restrictions, guardian contacts and feeding notes for each child in your daycare.",
      },
      { property: "og:title", content: "Child profiles — Little Table" },
      {
        property: "og:description",
        content: "Allergies and dietary needs for every child in your care.",
      },
    ],
  }),
  component: ChildrenPage,
});

const emptyForm = {
  name: "",
  birth_date: "",
  guardian: "",
  guardian_contact: "",
  allergies: "",
  restrictions: "",
  notes: "",
  schedule_days: [0, 1, 2, 3, 4] as number[],
};

function ChildrenPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Child | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: children = [], isLoading } = useQuery({
    queryKey: ["children"],
    queryFn: async (): Promise<Child[]> => {
      const { data, error } = await supabase
        .from("children")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as Child[];
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const payload = {
        name: form.name.trim(),
        birth_date: form.birth_date || null,
        guardian: form.guardian.trim() || null,
        guardian_contact: form.guardian_contact.trim() || null,
        allergies: parseList(form.allergies),
        restrictions: parseList(form.restrictions),
        notes: form.notes.trim() || null,
        schedule_days: [...form.schedule_days].sort((a, b) => a - b),
      };
      if (editing) {
        const { error } = await supabase
          .from("children")
          .update(payload)
          .eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("children")
          .insert({ ...payload, user_id: userData.user!.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["children"] });
      setOpen(false);
      setEditing(null);
      setForm(emptyForm);
      toast.success("Profile saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("children").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["children"] });
      toast.success("Profile removed");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function openNew() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(child: Child) {
    setEditing(child);
    setForm({
      name: child.name,
      birth_date: child.birth_date ?? "",
      guardian: child.guardian ?? "",
      guardian_contact: child.guardian_contact ?? "",
      allergies: child.allergies.join(", "),
      restrictions: child.restrictions.join(", "),
      notes: child.notes ?? "",
      schedule_days: child.schedule_days ?? [],
    });
    setOpen(true);
  }

  function toggleDay(index: number) {
    setForm((f) => ({
      ...f,
      schedule_days: f.schedule_days.includes(index)
        ? f.schedule_days.filter((d) => d !== index)
        : [...f.schedule_days, index],
    }));
  }

  return (
    <main className="mx-auto max-w-5xl px-5 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Children</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Dietary needs used to check every meal you plan.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}>Add child</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90svh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit profile" : "New child profile"}</DialogTitle>
              <DialogDescription>
                Separate allergies and restrictions with commas.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="birth">Birth date</Label>
                  <Input
                    id="birth"
                    type="date"
                    value={form.birth_date}
                    onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="guardian">Guardian</Label>
                  <Input
                    id="guardian"
                    value={form.guardian}
                    onChange={(e) => setForm({ ...form, guardian: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contact">Guardian contact</Label>
                <Input
                  id="contact"
                  value={form.guardian_contact}
                  onChange={(e) =>
                    setForm({ ...form, guardian_contact: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Attends</Label>
                <div className="flex flex-wrap gap-1.5">
                  {DAYS.map((day, index) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(index)}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                        form.schedule_days.includes(index)
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="allergies">Allergies</Label>
                <Input
                  id="allergies"
                  placeholder="peanut, dairy, egg"
                  value={form.allergies}
                  onChange={(e) => setForm({ ...form, allergies: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Broad terms like "dairy", "gluten" or "tree nut" automatically cover common
                  ingredients (cheese, bread, almonds…).
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="restrictions">Dietary restrictions</Label>
                <Input
                  id="restrictions"
                  placeholder="pork, gelatin, no added sugar"
                  value={form.restrictions}
                  onChange={(e) => setForm({ ...form, restrictions: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="notes">Feeding notes</Label>
                <Textarea
                  id="notes"
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={() => save.mutate()}
                disabled={!form.name.trim() || save.isPending}
              >
                Save profile
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <p className="mt-10 text-sm text-muted-foreground">Loading…</p>
      ) : children.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border p-10 text-center">
          <h2 className="text-lg font-bold text-foreground">No children yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Add your first profile to start checking meals against allergies.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {children.map((child) => (
            <article
              key={child.id}
              className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-card-foreground">{child.name}</h2>
                  <p className="text-xs text-muted-foreground">
                    {[ageLabel(child.birth_date), child.guardian].filter(Boolean).join(" · ") ||
                      "No details yet"}
                  </p>
                  {child.schedule_days?.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {child.schedule_days.map((d) => (
                        <span
                          key={d}
                          className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                        >
                          {DAYS[d].slice(0, 3)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(child)}>
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => remove.mutate(child.id)}
                  >
                    Remove
                  </Button>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Allergies
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {child.allergies.length ? (
                      child.allergies.map((a) => (
                        <Badge key={a} variant="destructive">
                          {a}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">None recorded</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Restrictions
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {child.restrictions.length ? (
                      child.restrictions.map((r) => (
                        <Badge key={r} variant="secondary">
                          {r}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">None recorded</span>
                    )}
                  </div>
                </div>
                {child.notes && (
                  <p className="text-sm text-muted-foreground">{child.notes}</p>
                )}
                {child.guardian_contact && (
                  <p className="text-xs text-muted-foreground">{child.guardian_contact}</p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
