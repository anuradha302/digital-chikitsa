import { Check } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { FieldDef, SectionData, SectionDef } from "@/lib/case-paper";
import { cn } from "@/lib/utils";

interface FieldProps {
  field: FieldDef;
  value: unknown;
  onChange: (value: unknown) => void;
}

/** Renders one case-paper field according to its declared type. */
export function CaseField({ field, value, onChange }: FieldProps) {
  const id = `field-${field.id}`;

  if (field.type === "check") {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-3">
        <Checkbox
          id={id}
          checked={Boolean(value)}
          onCheckedChange={(checked) => onChange(Boolean(checked))}
        />
        <Label htmlFor={id} className="text-devanagari cursor-pointer text-sm font-medium">
          {field.label}
        </Label>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", field.wide && "sm:col-span-2")}>
      <Label htmlFor={id} className="text-devanagari text-sm font-medium text-foreground/90">
        {field.label}
      </Label>

      {field.type === "textarea" && (
        <Textarea
          id={id}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={3}
          className="text-devanagari resize-y bg-card"
        />
      )}

      {(field.type === "text" || field.type === "number" || field.type === "date") && (
        <Input
          id={id}
          type={field.type === "date" ? "date" : field.type === "number" ? "number" : "text"}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={cn("bg-card", field.type !== "date" && "text-devanagari")}
        />
      )}

      {field.type === "select" && (
        <Select
          value={(value as string) ?? ""}
          onValueChange={(v) => onChange(v === "__clear" ? "" : v)}
        >
          <SelectTrigger id={id} className="text-devanagari bg-card">
            <SelectValue placeholder="निवडा" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__clear" className="text-muted-foreground">
              — रिकामे —
            </SelectItem>
            {(field.options ?? []).map((opt) => (
              <SelectItem key={opt} value={opt} className="text-devanagari">
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {field.type === "radio" && (
        <RadioGroup
          value={(value as string) ?? ""}
          onValueChange={onChange}
          className="flex flex-wrap gap-2"
        >
          {(field.options ?? []).map((opt) => (
            <Label
              key={opt}
              className={cn(
                "text-devanagari flex cursor-pointer items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm transition-colors",
                value === opt && "border-primary bg-secondary text-secondary-foreground",
              )}
            >
              <RadioGroupItem value={opt} className="sr-only" />
              {opt}
            </Label>
          ))}
        </RadioGroup>
      )}

      {field.type === "multi" && (
        <MultiSelectChips
          options={field.options ?? []}
          value={Array.isArray(value) ? (value as string[]) : []}
          onChange={onChange}
        />
      )}
    </div>
  );
}

function MultiSelectChips({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const toggle = (opt: string) =>
    onChange(value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt]);

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = value.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            aria-pressed={active}
            onClick={() => toggle(opt)}
            className={cn(
              "text-devanagari inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground hover:bg-secondary",
            )}
          >
            {active && <Check className="size-3.5" aria-hidden />}
            {opt}
          </button>
        );
      })}
    </div>
  );
}

/** An editable case-paper section with local draft state and explicit save. */
export function SectionForm({
  section,
  initialData,
  onSave,
  saving,
}: {
  section: SectionDef;
  initialData: SectionData;
  onSave: (data: SectionData) => void;
  saving: boolean;
}) {
  const [draft, setDraft] = useState<SectionData>(initialData);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setDraft(initialData);
    setDirty(false);
  }, [initialData, section.key]);

  const setField = (fieldId: string, value: unknown) => {
    setDraft((prev) => ({ ...prev, [fieldId]: value }));
    setDirty(true);
  };

  return (
    <section className="card-record p-4 sm:p-5">
      <header className="mb-4">
        <h2 className="text-devanagari text-base font-semibold">{section.title}</h2>
        {section.subtitle && (
          <p className="text-devanagari text-xs text-muted-foreground">{section.subtitle}</p>
        )}
        <div className="rule-gold mt-3 h-px w-full" />
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {section.fields.map((field) => (
          <CaseField
            key={field.id}
            field={field}
            value={draft[field.id]}
            onChange={(v) => setField(field.id, v)}
          />
        ))}
      </div>

      <div className="mt-5 flex items-center justify-end gap-3">
        {dirty && <span className="text-xs text-muted-foreground">जतन केलेले नाही</span>}
        <Button
          type="button"
          onClick={() => {
            onSave(draft);
            setDirty(false);
          }}
          disabled={saving}
        >
          {saving ? "जतन होत आहे…" : "जतन करा"}
        </Button>
      </div>
    </section>
  );
}
