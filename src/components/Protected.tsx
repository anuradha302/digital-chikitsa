import { useNavigate } from "@tanstack/react-router";
import { Leaf } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { supabase } from "@/integrations/supabase/client";
import { fetchClinic } from "@/lib/repository";

export function FullScreenLoader({ label = "लोड होत आहे…" }: { label?: string }) {
  return (
    <div className="grid min-h-screen place-items-center bg-background">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Leaf className="size-6 animate-pulse text-primary" aria-hidden />
        <p className="text-devanagari text-sm">{label}</p>
      </div>
    </div>
  );
}

/**
 * Client-side route guard. Redirects to /login when signed out, and to /setup
 * when the doctor hasn't configured their clinic yet.
 */
export function Protected({
  children,
  requireClinic = true,
}: {
  children: ReactNode;
  requireClinic?: boolean;
}) {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      if (!data.session) {
        navigate({ to: "/login" });
        return;
      }
      if (requireClinic) {
        try {
          const clinic = await fetchClinic();
          if (!clinic) {
            navigate({ to: "/setup" });
            return;
          }
        } catch {
          // Show the screen anyway; individual queries will surface errors.
        }
      }
      setReady(true);
    })();
    return () => {
      active = false;
    };
  }, [navigate, requireClinic]);

  if (!ready) return <FullScreenLoader />;
  return <>{children}</>;
}
