import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Leaf } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "प्रवेश — आयुर्वेद केस पेपर" },
      { name: "description", content: "डिजिटल आयुर्वेद केस पेपरमध्ये साइन इन करा." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/dashboard" });
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast.success("खाते तयार झाले. कृपया साइन इन करा.");
        setMode("signin");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "प्रवेश अयशस्वी");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="surface-parchment grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="surface-veda mx-auto mb-4 grid size-14 place-items-center rounded-2xl text-primary-foreground shadow-md">
            <Leaf className="size-7" aria-hidden />
          </div>
          <h1 className="text-devanagari text-2xl font-semibold">आयुर्वेद केस पेपर</h1>
          <p className="text-devanagari mt-1 text-sm text-muted-foreground">
            डिजिटल आतुर निदान पत्रक
          </p>
        </div>

        <form onSubmit={submit} className="card-record space-y-4 p-6">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="doctor@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">पासवर्ड</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={6}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "कृपया थांबा…" : mode === "signin" ? "साइन इन" : "खाते तयार करा"}
          </Button>
          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="text-devanagari w-full text-center text-sm text-primary underline-offset-4 hover:underline"
          >
            {mode === "signin" ? "नवीन खाते तयार करा" : "आधीच खाते आहे? साइन इन करा"}
          </button>
        </form>
      </div>
    </div>
  );
}
