import type { Metadata, Viewport } from "next";
import { Instrument_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const instrument = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-instrument",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#100904",
};

export const metadata: Metadata = {
  title: "The Unreal Lab — We Make the Unreal Real",
  description:
    "A product studio for the age of AI. Two instruments shipped — Mumba.ai and ASHVAA — one growing in the dark.",
  keywords: ["AI", "product studio", "Mumba.ai", "ASHVAA", "The Unreal Lab"],
  icons: {
    icon: "/unreal-lab-mark.svg",
    apple: "/unreal-lab-mark.svg",
  },
  openGraph: {
    title: "The Unreal Lab",
    description: "A product studio for the age of AI. We make the unreal real.",
    url: "https://theunreallab.com",
    siteName: "The Unreal Lab",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Unreal Lab",
    description: "We Make the Unreal Real.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={instrument.variable}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
