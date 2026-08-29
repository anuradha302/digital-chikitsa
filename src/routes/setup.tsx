import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { FullScreenLoader, Protected } from "@/components/Protected";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClinic } from "@/lib/repository";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/setup")({
  head: () => ({
    meta: [
      { title: "दवाखाना नोंदणी — आयुर्वेद केस पेपर" },
      { name: "description", content: "तुमच्या आयुर्वेद दवाखान्याची माहिती नोंदवा." },
    ],
  }),
  component: SetupPage,
});

function SetupPage() {
  return (
    <Protected requireClinic={false}>
      <SetupForm />
    </Protected>
  );
}

function SetupForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    try {
      await createClinic({
        name: name.trim(),
        doctor_name: doctorName.trim() || null,
        phone: phone.trim() || null,
        address: address.trim() || null,
      });
      await queryClient.invalidateQueries({ queryKey: ["clinic"] });
      toast.success("दवाखाना नोंदवला");
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "जतन अयशस्वी");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="surface-parchment grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-devanagari text-2xl font-semibold">दवाखाना नोंदणी</h1>
          <p className="text-devanagari mt-1 text-sm text-muted-foreground">
            ही माहिती प्रत्येक केस पेपरच्या शीर्षकात दिसेल
          </p>
        </div>
        <form onSubmit={submit} className="card-record space-y-4 p-6">
          <div className="space-y-2">
            <Label htmlFor="clinic-name" className="text-devanagari">
              दवाखान्याचे नाव *
            </Label>
            <Input
              id="clinic-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-devanagari"
              placeholder="श्री आयुर्वेद चिकित्सालय"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="doctor-name" className="text-devanagari">
              वैद्यांचे नाव
            </Label>
            <Input
              id="doctor-name"
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
              className="text-devanagari"
              placeholder="वैद्य. …"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">दूरध्वनी</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address" className="text-devanagari">
              पत्ता
            </Label>
            <Textarea
              id="address"
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="text-devanagari"
            />
          </div>
          <Button type="submit" className="w-full" disabled={busy || !name.trim()}>
            {busy ? "जतन होत आहे…" : "सुरू करा"}
          </Button>
        </form>
      </div>
    </div>
  );
}
