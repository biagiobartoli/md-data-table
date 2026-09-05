import { Flame } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60 py-12">
      <div className="container flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div className="flex items-center gap-2.5">
          <Flame className="h-5 w-5 text-primary" aria-hidden="true" />
          <span className="font-display text-lg font-bold">Ember &amp; Ash</span>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          {["Menu", "The Craft", "Visit", "Careers"].map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase().replace(/\s+/g, "-")}`}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {l}
            </a>
          ))}
        </nav>
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Ember &amp; Ash, Brooklyn
        </p>
      </div>
    </footer>
  );
}
