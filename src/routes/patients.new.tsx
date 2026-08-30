import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { Protected } from "@/components/Protected";
import { CaseField } from "@/components/SectionForm";
import { Button } from "@/components/ui/button";
import { useClinic } from "@/hooks/useClinic";
import { PATIENT_FIELDS, type SectionDef, type SectionData } from "@/lib/case-paper";
import { todayISO } from "@/lib/format";
import { createPatient, nextRegNo } from "@/lib/repository";

export const Route = createFileRoute("/patients/new")({
  head: () => ({
    meta: [
      { title: "नवीन रुग्ण नोंदणी — आयुर्वेद केस पेपर" },
      { name: "description", content: "नवीन रुग्णाची नोंदणी करा." },
    ],
  }),
  component: NewPatientPage,
});

const IDENTITY_SECTION: SectionDef = {
  key: "identity",
  title: "रुग्णाची माहिती",
  fields: PATIENT_FIELDS,
};

function NewPatientPage() {
  return (
    <Protected>
      <AppShell title="नवीन रुग्ण नोंदणी" back={{ to: "/dashboard" }}>
        <NewPatientForm />
      </AppShell>
    </Protected>
  );
}

function NewPatientForm() {
  const navigate = useNavigate();
  const { clinic } = useClinic();
  const [form, setForm] = useState<SectionData>({ visit_date: todayISO() });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    nextRegNo()
      .then((n) => setForm((f) => (f["reg_no"] ? f : { ...f, reg_no: n })))
      .catch(() => {});
  }, []);

  const submit = async () => {
    const name = String(form["name"] ?? "").trim();
    if (!name) {
      toast.error("रुग्णाचे नाव आवश्यक आहे");
      return;
    }
    if (!clinic) {
      toast.error("आधी दवाखाना नोंदवा");
      return;
    }
    setBusy(true);
    try {
      const patient = await createPatient(clinic.id, {
        name,
        reg_no: (form["reg_no"] as string) || null,
        visit_date: (form["visit_date"] as string) || todayISO(),
        gender: (form["gender"] as string) || null,
        age: (form["age"] as string) || null,
        weight: (form["weight"] as string) || null,
        height: (form["height"] as string) || null,
        education: (form["education"] as string) || null,
        occupation: (form["occupation"] as string) || null,
        birth_place: (form["birth_place"] as string) || null,
        birth_datetime: (form["birth_datetime"] as string) || null,
        email: (form["email"] as string) || null,
        address: (form["address"] as string) || null,
        whatsapp: (form["whatsapp"] as string) || null,
        mobile: (form["mobile"] as string) || null,
        reference: (form["reference"] as string) || null,
      });
      toast.success("रुग्ण नोंदवला");
      navigate({ to: "/patients/$id", params: { id: patient.id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "नोंदणी अयशस्वी");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="card-record p-4 sm:p-5">
      <h2 className="text-devanagari mb-4 text-base font-semibold">रुग्णाची माहिती</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {IDENTITY_SECTION.fields.map((field) => (
          <CaseField
            key={field.id}
            field={field}
            value={form[field.id]}
            onChange={(v) => setForm((f) => ({ ...f, [field.id]: v }))}
          />
        ))}
      </div>
      <div className="mt-6 flex justify-end">
        <Button onClick={submit} disabled={busy}>
          {busy ? "नोंदवत आहे…" : "रुग्ण नोंदवा"}
        </Button>
      </div>
    </section>
  );
}
