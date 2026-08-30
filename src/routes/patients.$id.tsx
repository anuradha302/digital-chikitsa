import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { NotebookPen, Pencil, Plus, Printer, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { AppShell, EmptyState, ErrorNotice, LoadingRows } from "@/components/AppShell";
import { FreehandCanvas } from "@/components/FreehandCanvas";
import { CaseField, SectionForm } from "@/components/SectionForm";
import { Protected } from "@/components/Protected";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  CASE_SECTIONS,
  PATIENT_FIELDS,
  SECTION_GROUPS,
  formatValue,
  sectionByKey,
  sectionHasData,
  type SectionData,
} from "@/lib/case-paper";
import { formatDate, formatDateTime } from "@/lib/format";
import {
  createDrawing,
  createNote,
  deleteDrawing,
  deleteNote,
  drawingUrl,
  fetchCaseSections,
  fetchDrawings,
  fetchNotes,
  fetchPatient,
  saveCaseSection,
  saveDrawingImage,
  updatePatient,
  type Drawing,
  type Patient,
} from "@/lib/repository";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/patients/$id")({
  head: () => ({
    meta: [
      { title: "रुग्ण केस पेपर — आयुर्वेद केस पेपर" },
      { name: "description", content: "रुग्णाचे संपूर्ण आतुर निदान पत्रक, नोंदी व चित्रे." },
    ],
  }),
  component: PatientPage,
});

type Tab = "summary" | "case" | "notes" | "drawings";

function PatientPage() {
  const { id } = Route.useParams();
  const [tab, setTab] = useState<Tab>("summary");

  const patientQuery = useQuery({ queryKey: ["patient", id], queryFn: () => fetchPatient(id) });
  const patient = patientQuery.data ?? null;

  return (
    <Protected>
      <AppShell
        title={patient?.name ?? "रुग्ण"}
        subtitle={patient ? `नोंदणी क्र. ${patient.reg_no ?? "—"} · ${formatDate(patient.visit_date)}` : undefined}
        back={{ to: "/patients" }}
        actions={
          <button
            type="button"
            onClick={() => window.print()}
            aria-label="छापा"
            className="rounded-full bg-primary-foreground/10 p-2 transition-colors hover:bg-primary-foreground/20"
          >
            <Printer className="size-4" />
          </button>
        }
      >
        {patientQuery.isLoading ? (
          <LoadingRows />
        ) : patientQuery.error ? (
          <ErrorNotice />
        ) : !patient ? (
          <EmptyState title="रुग्ण आढळला नाही" />
        ) : (
          <div className="space-y-5">
            <nav className="no-print flex gap-2 overflow-x-auto pb-1">
              {(
                [
                  ["summary", "सारांश"],
                  ["case", "केस पेपर"],
                  ["notes", "नोंदी"],
                  ["drawings", "चित्रे"],
                ] as [Tab, string][]
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTab(key)}
                  className={cn(
                    "text-devanagari shrink-0 rounded-full border px-4 py-1.5 text-sm transition-colors",
                    tab === key
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card hover:bg-secondary",
                  )}
                >
                  {label}
                </button>
              ))}
            </nav>

            {tab === "summary" && <SummaryTab patient={patient} />}
            {tab === "case" && <CaseTab patientId={patient.id} />}
            {tab === "notes" && <NotesTab patientId={patient.id} />}
            {tab === "drawings" && <DrawingsTab patientId={patient.id} />}
          </div>
        )}
      </AppShell>
    </Protected>
  );
}

/* ------------------------------- summary -------------------------------- */

function SummaryTab({ patient }: { patient: Patient }) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<SectionData>({});
  const sectionsQuery = useQuery({
    queryKey: ["case-sections", patient.id],
    queryFn: () => fetchCaseSections(patient.id),
  });

  useEffect(() => {
    const next: SectionData = {};
    for (const f of PATIENT_FIELDS) next[f.id] = (patient as unknown as SectionData)[f.id] ?? "";
    setForm(next);
  }, [patient]);

  const save = useMutation({
    mutationFn: async (data: SectionData) => {
      const patch: Record<string, unknown> = {};
      for (const f of PATIENT_FIELDS) {
        const v = data[f.id];
        patch[f.id] = v === "" || v === undefined ? null : v;
      }
      patch["name"] = String(data["name"] ?? patient.name).trim() || patient.name;
      patch["visit_date"] = data["visit_date"] || patient.visit_date;
      return updatePatient(patient.id, patch as Partial<Patient>);
    },
    onSuccess: () => {
      toast.success("माहिती जतन झाली");
      setEditing(false);
      void qc.invalidateQueries({ queryKey: ["patient", patient.id] });
      void qc.invalidateQueries({ queryKey: ["patients"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "जतन अयशस्वी"),
  });

  return (
    <div className="space-y-5">
      <section className="card-record p-4 sm:p-5">
        <header className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-devanagari text-base font-semibold">रुग्णाची माहिती</h2>
          <Button
            variant="outline"
            size="sm"
            className="no-print"
            onClick={() => setEditing((v) => !v)}
          >
            <Pencil className="mr-1.5 size-3.5" aria-hidden />
            {editing ? "रद्द" : "संपादन"}
          </Button>
        </header>

        {editing ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              {PATIENT_FIELDS.map((field) => (
                <CaseField
                  key={field.id}
                  field={field}
                  value={form[field.id]}
                  onChange={(v) => setForm((f) => ({ ...f, [field.id]: v }))}
                />
              ))}
            </div>
            <div className="mt-5 flex justify-end">
              <Button onClick={() => save.mutate(form)} disabled={save.isPending}>
                {save.isPending ? "जतन होत आहे…" : "जतन करा"}
              </Button>
            </div>
          </>
        ) : (
          <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
            {PATIENT_FIELDS.map((f) => {
              const value = formatValue(f, (patient as unknown as SectionData)[f.id]);
              if (!value) return null;
              return (
                <div key={f.id} className={cn(f.wide && "sm:col-span-2")}>
                  <dt className="text-devanagari text-xs text-muted-foreground">{f.label}</dt>
                  <dd className="text-devanagari text-sm font-medium break-words">{value}</dd>
                </div>
              );
            })}
          </dl>
        )}
      </section>

      {sectionsQuery.isLoading ? (
        <LoadingRows count={2} />
      ) : (
        <div className="space-y-4">
          {CASE_SECTIONS.filter((s) => sectionHasData(s, sectionsQuery.data?.[s.key])).map((s) => (
            <section key={s.key} className="card-record p-4 sm:p-5">
              <h3 className="text-devanagari mb-3 text-sm font-semibold">{s.title}</h3>
              <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                {s.fields.map((f) => {
                  const value = formatValue(f, sectionsQuery.data?.[s.key]?.[f.id]);
                  if (!value) return null;
                  return (
                    <div key={f.id} className={cn(f.wide && "sm:col-span-2")}>
                      <dt className="text-devanagari text-xs text-muted-foreground">{f.label}</dt>
                      <dd className="text-devanagari text-sm whitespace-pre-wrap">{value}</dd>
                    </div>
                  );
                })}
              </dl>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------ case paper ------------------------------ */

function CaseTab({ patientId }: { patientId: string }) {
  const qc = useQueryClient();
  const [activeKey, setActiveKey] = useState<string>(CASE_SECTIONS[0]!.key);
  const query = useQuery({
    queryKey: ["case-sections", patientId],
    queryFn: () => fetchCaseSections(patientId),
  });

  const save = useMutation({
    mutationFn: (data: SectionData) =>
      saveCaseSection(patientId, activeKey, data as Record<string, unknown>),
    onSuccess: () => {
      toast.success("विभाग जतन झाला");
      void qc.invalidateQueries({ queryKey: ["case-sections", patientId] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "जतन अयशस्वी"),
  });

  const section = sectionByKey(activeKey);
  const initial = useMemo(
    () => (query.data?.[activeKey] ?? {}) as SectionData,
    [query.data, activeKey],
  );

  if (query.isLoading) return <LoadingRows />;
  if (query.error) return <ErrorNotice />;

  return (
    <div className="space-y-4">
      <div className="no-print space-y-3">
        {SECTION_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="text-devanagari mb-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {group.label}
            </p>
            <div className="flex flex-wrap gap-2">
              {group.keys.map((key) => {
                const s = sectionByKey(key);
                if (!s) return null;
                const filled = sectionHasData(s, query.data?.[key]);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveKey(key)}
                    className={cn(
                      "text-devanagari rounded-full border px-3 py-1.5 text-xs transition-colors",
                      activeKey === key
                        ? "border-primary bg-primary text-primary-foreground"
                        : filled
                          ? "border-primary/40 bg-secondary text-secondary-foreground"
                          : "border-border bg-card hover:bg-secondary",
                    )}
                  >
                    {s.title}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {section && (
        <SectionForm
          section={section}
          initialData={initial}
          onSave={(data) => save.mutate(data)}
          saving={save.isPending}
        />
      )}
    </div>
  );
}

/* -------------------------------- notes --------------------------------- */

function NotesTab({ patientId }: { patientId: string }) {
  const qc = useQueryClient();
  const [body, setBody] = useState("");
  const query = useQuery({ queryKey: ["notes", patientId], queryFn: () => fetchNotes(patientId) });

  const add = useMutation({
    mutationFn: () => createNote(patientId, body.trim()),
    onSuccess: () => {
      setBody("");
      void qc.invalidateQueries({ queryKey: ["notes", patientId] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "नोंद जतन अयशस्वी"),
  });

  const remove = useMutation({
    mutationFn: (noteId: string) => deleteNote(noteId),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["notes", patientId] }),
  });

  return (
    <div className="space-y-4">
      <section className="card-record no-print p-4">
        <h2 className="text-devanagari mb-3 text-sm font-semibold">नवीन नोंद</h2>
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          placeholder="आजची निरीक्षणे, औषध बदल, सल्ला…"
          className="text-devanagari bg-card"
        />
        <div className="mt-3 flex justify-end">
          <Button onClick={() => add.mutate()} disabled={!body.trim() || add.isPending}>
            <NotebookPen className="mr-1.5 size-4" aria-hidden />
            नोंद जतन करा
          </Button>
        </div>
      </section>

      {query.isLoading ? (
        <LoadingRows count={3} />
      ) : query.error ? (
        <ErrorNotice />
      ) : !query.data?.length ? (
        <EmptyState title="अजून नोंदी नाहीत" description="प्रत्येक भेटीची नोंद इथे जतन करा." />
      ) : (
        <ul className="space-y-3">
          {query.data.map((note) => (
            <li key={note.id} className="card-record p-4">
              <div className="flex items-start gap-3">
                <p className="text-devanagari min-w-0 flex-1 text-sm whitespace-pre-wrap">
                  {note.body}
                </p>
                <button
                  type="button"
                  onClick={() => remove.mutate(note.id)}
                  aria-label="नोंद हटवा"
                  className="no-print rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{formatDateTime(note.created_at)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ------------------------------- drawings ------------------------------- */

function DrawingsTab({ patientId }: { patientId: string }) {
  const qc = useQueryClient();
  const [active, setActive] = useState<Drawing | null>(null);
  const query = useQuery({
    queryKey: ["drawings", patientId],
    queryFn: () => fetchDrawings(patientId),
  });

  const add = useMutation({
    mutationFn: () => createDrawing(patientId, `चित्र ${(query.data?.length ?? 0) + 1}`),
    onSuccess: (d) => {
      setActive(d);
      void qc.invalidateQueries({ queryKey: ["drawings", patientId] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "चित्र तयार करता आले नाही"),
  });

  const remove = useMutation({
    mutationFn: (d: Drawing) => deleteDrawing(d),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["drawings", patientId] }),
  });

  if (active) {
    return <DrawingEditor drawing={active} onClose={() => setActive(null)} />;
  }

  return (
    <div className="space-y-4">
      <div className="no-print flex justify-end">
        <Button onClick={() => add.mutate()} disabled={add.isPending}>
          <Plus className="mr-1.5 size-4" aria-hidden />
          नवीन चित्र
        </Button>
      </div>

      {query.isLoading ? (
        <LoadingRows count={2} />
      ) : query.error ? (
        <ErrorNotice />
      ) : !query.data?.length ? (
        <EmptyState
          title="अजून चित्रे नाहीत"
          description="हस्तलिखित नोंद किंवा शरीरचित्र काढण्यासाठी नवीन चित्र सुरू करा."
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {query.data.map((d) => (
            <li key={d.id} className="card-record flex items-center gap-3 p-4">
              <button
                type="button"
                onClick={() => setActive(d)}
                className="text-devanagari min-w-0 flex-1 text-left text-sm font-medium"
              >
                {d.title}
                <span className="block text-xs font-normal text-muted-foreground">
                  {formatDateTime(d.updated_at)}
                </span>
              </button>
              <button
                type="button"
                onClick={() => remove.mutate(d)}
                aria-label="चित्र हटवा"
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function DrawingEditor({ drawing, onClose }: { drawing: Drawing; onClose: () => void }) {
  const qc = useQueryClient();
  const urlQuery = useQuery({
    queryKey: ["drawing-url", drawing.id, drawing.storage_path],
    queryFn: () => drawingUrl(drawing.storage_path),
  });

  const save = useMutation({
    mutationFn: (blob: Blob) => saveDrawingImage(drawing, blob),
    onSuccess: () => {
      toast.success("चित्र जतन झाले");
      void qc.invalidateQueries({ queryKey: ["drawings", drawing.patient_id] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "चित्र जतन अयशस्वी"),
  });

  if (urlQuery.isLoading) return <LoadingRows count={2} />;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-devanagari text-sm font-semibold">{drawing.title}</h2>
        <Button variant="outline" size="sm" onClick={onClose}>
          मागे
        </Button>
      </div>
      <FreehandCanvas
        initialImageUrl={urlQuery.data ?? null}
        onSave={(blob) => save.mutate(blob)}
        saving={save.isPending}
      />
    </div>
  );
}
