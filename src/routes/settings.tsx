import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AppShell, LoadingRows } from "@/components/AppShell";
import { Protected } from "@/components/Protected";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useClinic } from "@/hooks/useClinic";
import { supabase } from "@/integrations/supabase/client";
import { updateClinic } from "@/lib/repository";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "सेटिंग्ज — आयुर्वेद केस पेपर" },
      { name: "description", content: "दवाखान्याची माहिती व खाते सेटिंग्ज." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <Protected>
      <AppShell title="सेटिंग्ज" back={{ to: "/dashboard" }}>
        <SettingsBody />
      </AppShell>
    </Protected>
  );
}

function SettingsBody() {
  const { clinic, isLoading } = useClinic();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (clinic) {
      setName(clinic.name);
      setDoctorName(clinic.doctor_name ?? "");
      setPhone(clinic.phone ?? "");
      setEmail(clinic.email ?? "");
      setAddress(clinic.address ?? "");
    }
  }, [clinic]);

  if (isLoading) return <LoadingRows />;
  if (!clinic) return null;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await updateClinic(clinic.id, {
        name: name.trim() || clinic.name,
        doctor_name: doctorName.trim() || null,
        phone: phone.trim() || null,
        email: email.trim() || null,
        address: address.trim() || null,
      });
      await queryClient.invalidateQueries({ queryKey: ["clinic"] });
      toast.success("माहिती जतन झाली");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "जतन अयशस्वी");
    } finally {
      setBusy(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };

  return (
    <div className="space-y-6">
      <form onSubmit={save} className="card-record space-y-4 p-5">
        <h2 className="text-devanagari text-base font-semibold">दवाखान्याची माहिती</h2>
        <div className="space-y-2">
          <Label htmlFor="s-name" className="text-devanagari">
            दवाखान्याचे नाव
          </Label>
          <Input
            id="s-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="text-devanagari"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="s-doctor" className="text-devanagari">
            वैद्यांचे नाव
          </Label>
          <Input
            id="s-doctor"
            value={doctorName}
            onChange={(e) => setDoctorName(e.target.value)}
            className="text-devanagari"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="s-phone">दूरध्वनी</Label>
            <Input id="s-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="s-email">E-mail</Label>
            <Input id="s-email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="s-address" className="text-devanagari">
            पत्ता
          </Label>
          <Textarea
            id="s-address"
            rows={2}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="text-devanagari"
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={busy}>
            {busy ? "जतन होत आहे…" : "जतन करा"}
          </Button>
        </div>
      </form>

      <div className="card-record flex items-center justify-between p-5">
        <div>
          <p className="text-devanagari text-sm font-semibold">साइन आउट</p>
          <p className="text-xs text-muted-foreground">या उपकरणावरून बाहेर पडा</p>
        </div>
        <Button variant="outline" onClick={signOut}>
          <LogOut className="mr-1 size-4" aria-hidden />
          साइन आउट
        </Button>
      </div>
    </div>
  );
}
