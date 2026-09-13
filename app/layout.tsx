import type { Metadata, Viewport } from "next";
import {
  Archivo,
  Libre_Caslon_Display,
  Tiro_Devanagari_Sanskrit,
} from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const caslon = Libre_Caslon_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-caslon",
  display: "swap",
});

const archivo = Archivo({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

const tiro = Tiro_Devanagari_Sanskrit({
  subsets: ["devanagari", "latin"],
  weight: "400",
  variable: "--font-tiro",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#100c08",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://theunreallab.com"),
  title: "The Unreal Lab — Every Arjuna needs a Krishna.",
  description:
    "A venture studio. We build AI products of our own, advise companies on AI that has to actually work, and ride beside founders who are too early for everyone else.",
  keywords: [
    "venture studio",
    "AI",
    "founders",
    "enterprise AI",
    "Mumba.ai",
    "ASHVAA",
    "The Unreal Lab",
  ],
  icons: {
    icon: "/mark.svg",
    apple: "/mark.svg",
  },
  openGraph: {
    title: "The Unreal Lab — Every Arjuna needs a Krishna.",
    description:
      "A venture studio. We build, we advise, we partner, we back founders from nothing to the field. Not a fund yet. A charioteer first.",
    url: "https://theunreallab.com",
    siteName: "The Unreal Lab",
    type: "website",
    images: [{ url: "/scenes/00-chariot.jpg", width: 1344, height: 752 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Unreal Lab — Every Arjuna needs a Krishna.",
    description:
      "A venture studio for founders who are too early for everyone else.",
    images: ["/scenes/00-chariot.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${caslon.variable} ${archivo.variable} ${tiro.variable}`}
    >
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
