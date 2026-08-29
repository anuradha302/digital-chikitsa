import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ChevronDown, Search } from "lucide-react";
import { useEffect, useState } from "react";

import { AppShell, EmptyState, ErrorNotice, LoadingRows } from "@/components/AppShell";
import { Protected } from "@/components/Protected";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate, monthLabel } from "@/lib/format";
import {
  fetchMonthBuckets,
  fetchPatientsByMonth,
  searchPatients,
  type PatientListItem,
} from "@/lib/repository";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/patients/")({
  head: () => ({
    meta: [
      { title: "रुग्ण नोंदी — आयुर्वेद केस पेपर" },
      { name: "description", content: "महिन्यानुसार रुग्ण नोंदी ब्राउझ करा किंवा शोधा." },
    ],
  }),
  component: PatientsPage,
});

function PatientsPage() {
  return (
    <Protected>
      <AppShell title="रुग्ण नोंदी" back={{ to: "/dashboard" }}>
        <PatientsBody />
      </AppShell>
    </Protected>
  );
}

function PatientsBody() {
  const [term, setTerm] = useState("");
  const [debounced, setDebounced] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebounced(term), 300);
    return () => clearTimeout(t);
  }, [term]);

  return (
    <div className="space-y-5">
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="नाव, नोंदणी क्र. किंवा मोबाईल शोधा"
          className="text-devanagari bg-card pl-9"
          aria-label="रुग्ण शोधा"
        />
      </div>
      {debounced.trim() ? <SearchResults term={debounced} /> : <MonthBrowser />}
    </div>
  );
}

function SearchResults({ term }: { term: string }) {
  const query = useQuery({
    queryKey: ["patients", "search", term],
    queryFn: () => searchPatients(term),
  });
  if (query.isLoading) return <LoadingRows />;
  if (query.error) return <ErrorNotice />;
  if (!query.data?.length)
    return <EmptyState title="जुळणारे रुग्ण आढळले नाहीत" description={`"${term}" साठी निकाल रिकामे`} />;
  return <PatientRows items={query.data} />;
}

function MonthBrowser() {
  const bucketsQuery = useQuery({ queryKey: ["patients", "months"], queryFn: fetchMonthBuckets });
  const [open, setOpen] = useState<string | null>(null);

  if (bucketsQuery.isLoading) return <LoadingRows />;
  if (bucketsQuery.error) return <ErrorNotice />;
  if (!bucketsQuery.data?.length)
    return (
      <EmptyState
        title="अजून नोंदी नाहीत"
        description="नवीन रुग्ण नोंदवल्यावर इथे महिन्यानुसार नोंदी दिसतील."
      />
    );

  return (
    <div className="space-y-2">
      {bucketsQuery.data.map((b) => {
        const key = `${b.year}-${b.month}`;
        const isOpen = open === key;
        return (
          <div key={key} className="card-record overflow-hidden">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : key)}
              aria-expanded={isOpen}
              className="flex w-full items-center gap-3 px-4 py-3 text-left"
            >
              <div className="min-w-0 flex-1">
                <p className="text-devanagari font-semibold">
                  {monthLabel(b.month)} {b.year}
                </p>
                <p className="text-xs text-muted-foreground">{b.count} रुग्ण</p>
              </div>
              <ChevronDown
                className={cn("size-4 text-muted-foreground transition-transform", isOpen && "rotate-180")}
                aria-hidden
              />
            </button>
            {isOpen && (
              <div className="border-t border-border px-3 py-3">
                <MonthPatients year={b.year} month={b.month} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function MonthPatients({ year, month }: { year: number; month: number }) {
  const [page, setPage] = useState(0);
  const [all, setAll] = useState<PatientListItem[]>([]);
  const query = useQuery({
    queryKey: ["patients", "month", year, month, page],
    queryFn: () => fetchPatientsByMonth(year, month, page),
  });

  useEffect(() => {
    if (query.data) setAll((prev) => (page === 0 ? query.data.items : [...prev, ...query.data.items]));
  }, [query.data, page]);

  if (query.isLoading && page === 0) return <LoadingRows count={3} />;
  if (query.error) return <ErrorNotice />;

  return (
    <div className="space-y-2">
      <PatientRows items={all} />
      {query.data?.hasMore && (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          disabled={query.isFetching}
          onClick={() => setPage((p) => p + 1)}
        >
          {query.isFetching ? "लोड होत आहे…" : "आणखी दाखवा"}
        </Button>
      )}
    </div>
  );
}

function PatientRows({ items }: { items: PatientListItem[] }) {
  return (
    <div className="space-y-2">
      {items.map((p) => (
        <Link
          key={p.id}
          to="/patients/$id"
          params={{ id: p.id }}
          className="card-record card-record-hover flex items-center gap-3 px-4 py-3"
        >
          <div className="min-w-0 flex-1">
            <p className="text-devanagari truncate font-medium">{p.name}</p>
            <p className="text-xs text-muted-foreground">
              {p.reg_no ? `नोंदणी ${p.reg_no} · ` : ""}
              {[p.gender, p.age && `${p.age} वर्षे`].filter(Boolean).join(" · ")}
            </p>
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">{formatDate(p.visit_date)}</span>
        </Link>
      ))}
    </div>
  );
}
