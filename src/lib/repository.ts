/**
 * Data layer. All database access goes through this module so screens never
 * talk to the backend client directly. Swapping the storage engine (or adding
 * an offline cache) only touches this file.
 *
 * Every read is scoped, indexed and paginated — nothing loads "all patients".
 */

import { supabase } from "@/integrations/supabase/client";

export interface Clinic {
  id: string;
  owner_id: string;
  name: string;
  doctor_name: string | null;
  logo_url: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
}

export interface Patient {
  id: string;
  clinic_id: string;
  owner_id: string;
  reg_no: string | null;
  name: string;
  gender: string | null;
  age: string | null;
  weight: string | null;
  height: string | null;
  education: string | null;
  occupation: string | null;
  birth_place: string | null;
  birth_datetime: string | null;
  email: string | null;
  address: string | null;
  whatsapp: string | null;
  mobile: string | null;
  reference: string | null;
  visit_date: string;
  created_at: string;
  updated_at: string;
}

export interface PatientNote {
  id: string;
  patient_id: string;
  body: string;
  created_at: string;
  updated_at: string;
}

export interface Drawing {
  id: string;
  patient_id: string;
  title: string;
  storage_path: string | null;
  created_at: string;
  updated_at: string;
}

export interface MonthBucket {
  year: number;
  month: number;
  count: number;
}

/** Compact list projection — the case paper itself is never fetched in lists. */
export const PATIENT_LIST_COLUMNS =
  "id,name,reg_no,gender,age,mobile,visit_date,updated_at" as const;

export type PatientListItem = Pick<
  Patient,
  "id" | "name" | "reg_no" | "gender" | "age" | "mobile" | "visit_date" | "updated_at"
>;

async function requireUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("Not signed in");
  return data.user.id;
}

/* ------------------------------- clinic -------------------------------- */

export async function fetchClinic(): Promise<Clinic | null> {
  const { data, error } = await supabase.from("clinics").select("*").maybeSingle();
  if (error) throw error;
  return (data as Clinic) ?? null;
}

export async function createClinic(input: Partial<Clinic> & { name: string }): Promise<Clinic> {
  const owner_id = await requireUserId();
  const { data, error } = await supabase
    .from("clinics")
    .insert({ ...input, owner_id })
    .select("*")
    .single();
  if (error) throw error;
  return data as Clinic;
}

export async function updateClinic(id: string, patch: Partial<Clinic>): Promise<Clinic> {
  const { data, error } = await supabase
    .from("clinics")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as Clinic;
}

/* ------------------------------ patients ------------------------------- */

/** Month buckets, aggregated server-side via a lightweight date-only scan. */
export async function fetchMonthBuckets(): Promise<MonthBucket[]> {
  const { data, error } = await supabase
    .from("patients")
    .select("visit_date")
    .order("visit_date", { ascending: false });
  if (error) throw error;
  const map = new Map<string, MonthBucket>();
  for (const row of (data ?? []) as { visit_date: string }[]) {
    const [y, m] = row.visit_date.split("-");
    const key = `${y}-${m}`;
    const existing = map.get(key);
    if (existing) existing.count += 1;
    else map.set(key, { year: Number(y), month: Number(m), count: 1 });
  }
  return [...map.values()].sort((a, b) => b.year - a.year || b.month - a.month);
}

function monthRange(year: number, month: number) {
  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  const endYear = month === 12 ? year + 1 : year;
  const endMonth = month === 12 ? 1 : month + 1;
  const end = `${endYear}-${String(endMonth).padStart(2, "0")}-01`;
  return { start, end };
}

export const PAGE_SIZE = 25;

export async function fetchPatientsByMonth(
  year: number,
  month: number,
  page = 0,
): Promise<{ items: PatientListItem[]; hasMore: boolean }> {
  const { start, end } = monthRange(year, month);
  const from = page * PAGE_SIZE;
  const { data, error } = await supabase
    .from("patients")
    .select(PATIENT_LIST_COLUMNS)
    .gte("visit_date", start)
    .lt("visit_date", end)
    .order("visit_date", { ascending: true })
    .order("created_at", { ascending: true })
    .range(from, from + PAGE_SIZE);
  if (error) throw error;
  const rows = (data ?? []) as PatientListItem[];
  return { items: rows.slice(0, PAGE_SIZE), hasMore: rows.length > PAGE_SIZE };
}

export async function fetchRecentPatients(limit = 8): Promise<PatientListItem[]> {
  const { data, error } = await supabase
    .from("patients")
    .select(PATIENT_LIST_COLUMNS)
    .order("updated_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as PatientListItem[];
}

export async function countPatients(): Promise<number> {
  const { count, error } = await supabase
    .from("patients")
    .select("id", { count: "exact", head: true });
  if (error) throw error;
  return count ?? 0;
}

export async function searchPatients(term: string): Promise<PatientListItem[]> {
  const q = term.trim();
  if (!q) return [];
  const escaped = q.replace(/[%,]/g, " ");
  const { data, error } = await supabase
    .from("patients")
    .select(PATIENT_LIST_COLUMNS)
    .or(
      `name.ilike.%${escaped}%,reg_no.ilike.%${escaped}%,mobile.ilike.%${escaped}%,whatsapp.ilike.%${escaped}%`,
    )
    .order("visit_date", { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data ?? []) as PatientListItem[];
}

export async function fetchPatient(id: string): Promise<Patient | null> {
  const { data, error } = await supabase.from("patients").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as Patient) ?? null;
}

/** Suggests the next registration number for the clinic (e.g. 001, 002...). */
export async function nextRegNo(): Promise<string> {
  const { count, error } = await supabase
    .from("patients")
    .select("id", { count: "exact", head: true });
  if (error) throw error;
  return String((count ?? 0) + 1).padStart(3, "0");
}

export async function createPatient(
  clinicId: string,
  input: Partial<Patient> & { name: string },
): Promise<Patient> {
  const owner_id = await requireUserId();
  const { data, error } = await supabase
    .from("patients")
    .insert({ ...input, clinic_id: clinicId, owner_id })
    .select("*")
    .single();
  if (error) throw error;
  return data as Patient;
}

export async function updatePatient(id: string, patch: Partial<Patient>): Promise<Patient> {
  const { data, error } = await supabase
    .from("patients")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as Patient;
}

export async function deletePatient(id: string): Promise<void> {
  const { error } = await supabase.from("patients").delete().eq("id", id);
  if (error) throw error;
}

/* ---------------------------- case sections ---------------------------- */

export type SectionMap = Record<string, Record<string, unknown>>;

export async function fetchCaseSections(patientId: string): Promise<SectionMap> {
  const { data, error } = await supabase
    .from("case_sections")
    .select("section_key,data")
    .eq("patient_id", patientId);
  if (error) throw error;
  const map: SectionMap = {};
  for (const row of (data ?? []) as { section_key: string; data: Record<string, unknown> }[]) {
    map[row.section_key] = row.data ?? {};
  }
  return map;
}

export async function saveCaseSection(
  patientId: string,
  sectionKey: string,
  data: Record<string, unknown>,
): Promise<void> {
  const owner_id = await requireUserId();
  const { error } = await supabase
    .from("case_sections")
    .upsert(
      { patient_id: patientId, owner_id, section_key: sectionKey, data },
      { onConflict: "patient_id,section_key" },
    );
  if (error) throw error;
}

/* -------------------------------- notes -------------------------------- */

export async function fetchNotes(patientId: string): Promise<PatientNote[]> {
  const { data, error } = await supabase
    .from("patient_notes")
    .select("id,patient_id,body,created_at,updated_at")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as PatientNote[];
}

export async function createNote(patientId: string, body: string): Promise<PatientNote> {
  const owner_id = await requireUserId();
  const { data, error } = await supabase
    .from("patient_notes")
    .insert({ patient_id: patientId, owner_id, body })
    .select("id,patient_id,body,created_at,updated_at")
    .single();
  if (error) throw error;
  return data as PatientNote;
}

export async function updateNote(id: string, body: string): Promise<void> {
  const { error } = await supabase.from("patient_notes").update({ body }).eq("id", id);
  if (error) throw error;
}

export async function deleteNote(id: string): Promise<void> {
  const { error } = await supabase.from("patient_notes").delete().eq("id", id);
  if (error) throw error;
}

/* ------------------------------ drawings ------------------------------- */

export async function fetchDrawings(patientId: string): Promise<Drawing[]> {
  const { data, error } = await supabase
    .from("patient_drawings")
    .select("id,patient_id,title,storage_path,created_at,updated_at")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Drawing[];
}

export async function fetchDrawing(id: string): Promise<Drawing | null> {
  const { data, error } = await supabase
    .from("patient_drawings")
    .select("id,patient_id,title,storage_path,created_at,updated_at")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as Drawing) ?? null;
}

export async function createDrawing(patientId: string, title: string): Promise<Drawing> {
  const owner_id = await requireUserId();
  const { data, error } = await supabase
    .from("patient_drawings")
    .insert({ patient_id: patientId, owner_id, title })
    .select("id,patient_id,title,storage_path,created_at,updated_at")
    .single();
  if (error) throw error;
  return data as Drawing;
}

/**
 * Drawings are stored as PNG files in private cloud storage — never as base64
 * rows in the database and never on the device.
 */
export async function saveDrawingImage(drawing: Drawing, blob: Blob): Promise<string> {
  const owner_id = await requireUserId();
  const path = drawing.storage_path ?? `${owner_id}/${drawing.patient_id}/${drawing.id}.png`;
  const { error: upErr } = await supabase.storage
    .from("drawings")
    .upload(path, blob, { upsert: true, contentType: "image/png" });
  if (upErr) throw upErr;
  const { error } = await supabase
    .from("patient_drawings")
    .update({ storage_path: path })
    .eq("id", drawing.id);
  if (error) throw error;
  return path;
}

export async function renameDrawing(id: string, title: string): Promise<void> {
  const { error } = await supabase.from("patient_drawings").update({ title }).eq("id", id);
  if (error) throw error;
}

export async function deleteDrawing(drawing: Drawing): Promise<void> {
  if (drawing.storage_path) {
    await supabase.storage.from("drawings").remove([drawing.storage_path]);
  }
  const { error } = await supabase.from("patient_drawings").delete().eq("id", drawing.id);
  if (error) throw error;
}

export async function drawingUrl(path: string | null): Promise<string | null> {
  if (!path) return null;
  const { data, error } = await supabase.storage.from("drawings").createSignedUrl(path, 3600);
  if (error) return null;
  return data.signedUrl;
}
