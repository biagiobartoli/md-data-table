import type { Metadata } from "next";
import { Playfair_Display_SC, Karla } from "next/font/google";
import "./globals.css";

const display = Playfair_Display_SC({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-display",
  display: "swap",
});

const sans = Karla({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ember & Ash — Flame-Grilled Burgers",
  description:
    "Dry-aged beef, charcoal-grilled over open flame, stacked on brioche baked each morning. Ember & Ash, Brooklyn.",
  openGraph: {
    title: "Ember & Ash — Flame-Grilled Burgers",
    description:
      "Dry-aged beef, charcoal-grilled over open flame. Brooklyn, NY.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="font-sans">
        <a
          href="#menu"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
        >
          Skip to menu
        </a>
        {children}
      </body>
    </html>
  );
}
