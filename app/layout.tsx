import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Unreal Lab — We Make the Unreal Real",
  description: "A product studio at the edge of AI and human experience. We build tools that shouldn't exist yet.",
  keywords: ["AI", "product studio", "Mumba.ai", "conversational AI", "startup"],
  openGraph: {
    title: "The Unreal Lab",
    description: "A product studio at the edge of AI and human experience.",
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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:ital,wght@0,300;0,400;1,300&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
