import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CalendarDays, Leaf, NotebookPen, PenTool, ShieldCheck, Users } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "आयुर्वेद केस पेपर — डिजिटल रुग्ण नोंदवही" },
      {
        name: "description",
        content:
          "आयुर्वेद दवाखान्यासाठी डिजिटल आतुर निदान पत्रक — रुग्ण नोंदणी, अष्टविध व दशविध परीक्षण, चिकित्सा नोंदी आणि हस्तलिखित चित्रे एकाच ठिकाणी.",
      },
      { property: "og:title", content: "आयुर्वेद केस पेपर — डिजिटल रुग्ण नोंदवही" },
      {
        property: "og:description",
        content: "आयुर्वेद दवाखान्यांसाठी संपूर्ण डिजिटल केस पेपर व रुग्ण व्यवस्थापन.",
      },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: NotebookPen,
    title: "संपूर्ण आतुर निदान पत्रक",
    body: "संमतीपत्रक, प्रमुख वेदना, अष्टविध व दशविध परीक्षण, स्रोतस, व्याधीविनिश्चय व चिकित्सा.",
  },
  {
    icon: CalendarDays,
    title: "महिन्यानुसार नोंदी",
    body: "जुनी नोंदवही जशी होती तशीच — महिन्यानुसार रुग्ण, झटपट शोध व पुनर्भेटीच्या नोंदी.",
  },
  {
    icon: PenTool,
    title: "हस्तलिखित चित्रे",
    body: "बोट किंवा स्टायलसने काढलेली शरीरचित्रे व नोंदी सुरक्षितपणे जतन होतात.",
  },
  {
    icon: ShieldCheck,
    title: "सुरक्षित व खाजगी",
    body: "प्रत्येक दवाखान्याचा डेटा वेगळा — केवळ त्या डॉक्टरलाच दिसतो.",
  },
];

function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (active && data.session) navigate({ to: "/dashboard" });
    });
    return () => {
      active = false;
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <header className="surface-veda text-primary-foreground">
        <div className="mx-auto w-full max-w-4xl px-5 py-14 sm:py-20">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-3 py-1 text-xs">
            <Leaf className="size-3.5" aria-hidden />
            आयुर्वेद चिकित्सालयासाठी
          </span>
          <h1 className="text-devanagari mt-5 text-3xl leading-tight font-bold sm:text-5xl">
            कागदी केस पेपरची जागा घेणारी डिजिटल नोंदवही
          </h1>
          <p className="text-devanagari mt-4 max-w-2xl text-sm opacity-85 sm:text-base">
            रुग्णाची नोंदणी, संपूर्ण आतुर निदान पत्रक, भेटीच्या नोंदी आणि हस्तलिखित चित्रे — मोबाईलवर,
            कुठूनही, सुरक्षितपणे.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="secondary">
              <Link to="/login">सुरू करा</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Link to="/patients">नोंदी पहा</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl px-5 py-12">
        <h2 className="text-devanagari text-xl font-semibold">काय मिळेल</h2>
        <div className="rule-gold mt-3 h-px w-full" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <section key={f.title} className="card-record p-5">
              <span className="grid size-10 place-items-center rounded-full bg-accent text-accent-foreground">
                <f.icon className="size-5" aria-hidden />
              </span>
              <h3 className="text-devanagari mt-3 text-base font-semibold">{f.title}</h3>
              <p className="text-devanagari mt-1.5 text-sm text-muted-foreground">{f.body}</p>
            </section>
          ))}
        </div>

        <section className="card-record mt-10 flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center">
          <span className="grid size-11 place-items-center rounded-full bg-secondary text-secondary-foreground">
            <Users className="size-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-devanagari text-base font-semibold">
              अनेक दवाखान्यांसाठी तयार
            </h2>
            <p className="text-devanagari text-sm text-muted-foreground">
              प्रत्येक डॉक्टर स्वतःचा दवाखाना नोंदवतो आणि त्याच्या रुग्णांची नोंदवही स्वतंत्र राहते.
            </p>
          </div>
          <Button asChild>
            <Link to="/login">दवाखाना नोंदवा</Link>
          </Button>
        </section>
      </main>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        <p className="text-devanagari">आयुर्वेद केस पेपर · डिजिटल रुग्ण नोंदवही</p>
      </footer>
    </div>
  );
}
