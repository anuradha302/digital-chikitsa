import { Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Leaf } from "lucide-react";
import type { ReactNode } from "react";

import { useClinic } from "@/hooks/useClinic";
import { cn } from "@/lib/utils";

interface AppShellProps {
  title?: string;
  subtitle?: string;
  back?: { to: string; params?: Record<string, string> };
  actions?: ReactNode;
  children: ReactNode;
  /** Show the configured clinic name in the header band. */
  showClinic?: boolean;
}

/**
 * Consistent page chrome: clinic band, page heading, back navigation.
 * Mobile-first with a comfortable reading width on larger screens.
 */
export function AppShell({
  title,
  subtitle,
  back,
  actions,
  children,
  showClinic = true,
}: AppShellProps) {
  const { clinicName, doctorName } = useClinic();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background pb-16">
      <header className="surface-veda sticky top-0 z-20 text-primary-foreground shadow-md">
        <div className="mx-auto w-full max-w-4xl px-4 py-3">
          {showClinic && (
            <div className="flex items-center gap-2">
              <Leaf className="size-4 shrink-0 opacity-80" aria-hidden />
              <div className="min-w-0">
                <p className="text-devanagari truncate text-sm leading-tight font-semibold">
                  {clinicName || "आयुर्वेद चिकित्सालय"}
                </p>
                {doctorName && (
                  <p className="truncate text-[11px] leading-tight opacity-75">{doctorName}</p>
                )}
              </div>
            </div>
          )}

          {(title || back || actions) && (
            <div
              className={cn(
                "flex items-center gap-3",
                showClinic && "mt-3 border-t border-primary-foreground/15 pt-3",
              )}
            >
              {back && (
                <button
                  type="button"
                  onClick={() => router.navigate({ to: back.to, params: back.params })}
                  aria-label="मागे"
                  className="rounded-full bg-primary-foreground/10 p-2 transition-colors hover:bg-primary-foreground/20"
                >
                  <ArrowLeft className="size-4" />
                </button>
              )}
              <div className="min-w-0 flex-1">
                {title && (
                  <h1 className="text-devanagari truncate text-lg leading-tight font-semibold">
                    {title}
                  </h1>
                )}
                {subtitle && <p className="truncate text-xs opacity-75">{subtitle}</p>}
              </div>
              {actions}
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl px-4 py-5">{children}</main>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="card-record flex flex-col items-center gap-3 px-6 py-12 text-center">
      <div className="rounded-full bg-accent p-3 text-accent-foreground">
        <Leaf className="size-5" aria-hidden />
      </div>
      <p className="text-devanagari text-base font-medium">{title}</p>
      {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action}
    </div>
  );
}

export function LoadingRows({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3" aria-busy="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card-record h-20 animate-pulse bg-muted/60" />
      ))}
    </div>
  );
}

export function ErrorNotice({ message }: { message?: string }) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
    >
      {message || "माहिती मिळवताना अडचण आली. कृपया पुन्हा प्रयत्न करा."}
    </div>
  );
}

export function BackLink({ to, label }: { to: string; label: string }) {
  return (
    <Link to={to} className="text-sm text-muted-foreground underline-offset-4 hover:underline">
      {label}
    </Link>
  );
}
