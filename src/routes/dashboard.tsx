import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Search, Settings, UserPlus, Users } from "lucide-react";

import { AppShell, ErrorNotice, LoadingRows } from "@/components/AppShell";
import { Protected } from "@/components/Protected";
import { formatDate } from "@/lib/format";
import { countPatients, fetchRecentPatients } from "@/lib/repository";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "मुख्यपृष्ठ — आयुर्वेद केस पेपर" },
      { name: "description", content: "दवाखान्याचा आढावा — अलीकडील रुग्ण व नोंदी." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <Protected>
      <AppShell
        title="मुख्यपृष्ठ"
        actions={
          <Link
            to="/settings"
            aria-label="सेटिंग्ज"
            className="rounded-full bg-primary-foreground/10 p-2 transition-colors hover:bg-primary-foreground/20"
          >
            <Settings className="size-4" />
          </Link>
        }
      >
        <DashboardBody />
      </AppShell>
    </Protected>
  );
}

function DashboardBody() {
  const totalQuery = useQuery({ queryKey: ["patients", "count"], queryFn: countPatients });
  const recentQuery = useQuery({
    queryKey: ["patients", "recent"],
    queryFn: () => fetchRecentPatients(8),
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <Link
          to="/patients/new"
          className="card-record card-record-hover flex flex-col items-center gap-2 p-5 text-center"
        >
          <span className="surface-veda grid size-11 place-items-center rounded-full text-primary-foreground">
            <UserPlus className="size-5" aria-hidden />
          </span>
          <span className="text-devanagari text-sm font-semibold">नवीन रुग्ण</span>
        </Link>
        <Link
          to="/patients"
          className="card-record card-record-hover flex flex-col items-center gap-2 p-5 text-center"
        >
          <span className="grid size-11 place-items-center rounded-full bg-accent text-accent-foreground">
            <CalendarDays className="size-5" aria-hidden />
          </span>
          <span className="text-devanagari text-sm font-semibold">महिन्यानुसार नोंदी</span>
        </Link>
      </div>

      <div className="card-record flex items-center gap-3 p-4">
        <span className="grid size-10 place-items-center rounded-full bg-secondary text-secondary-foreground">
          <Users className="size-5" aria-hidden />
        </span>
        <div>
          <p className="text-2xl font-bold tabular-nums">{totalQuery.data ?? "…"}</p>
          <p className="text-devanagari text-xs text-muted-foreground">एकूण नोंदणीकृत रुग्ण</p>
        </div>
        <Link
          to="/patients"
          className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground"
        >
          <Search className="size-3.5" aria-hidden />
          शोधा
        </Link>
      </div>

      <section>
        <h2 className="text-devanagari mb-3 text-base font-semibold">अलीकडील रुग्ण</h2>
        {recentQuery.isLoading && <LoadingRows count={4} />}
        {recentQuery.error && <ErrorNotice />}
        {recentQuery.data && recentQuery.data.length === 0 && (
          <div className="card-record p-6 text-center">
            <p className="text-devanagari text-sm text-muted-foreground">
              अजून एकही रुग्ण नाही. "नवीन रुग्ण" वरून सुरुवात करा.
            </p>
          </div>
        )}
        <div className="space-y-2">
          {recentQuery.data?.map((p) => (
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
                  {formatDate(p.visit_date)}
                </p>
              </div>
              <span className="text-xs text-muted-foreground">→</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
