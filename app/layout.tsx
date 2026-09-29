import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Qmoosa Pi — Pi-native Compute Studio",
    template: "%s · Qmoosa Pi",
  },
  description:
    "A Pi-native workspace for verified Pioneer identity, official Pi payment handshakes, Conway computation, and transparent experimental tooling.",
  applicationName: "Qmoosa Pi",
  keywords: ["Pi Network", "Pi Browser", "Conway", "developer tools", "payments"],
  authors: [{ name: "Qmoosa Pi" }],
  creator: "Qmoosa Pi",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    title: "Qmoosa Pi — Pi-native Compute Studio",
    description:
      "Verified Pi identity, payment workflows, deterministic computation, and transparent experimental tooling.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#020617",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Script src="https://sdk.minepi.com/pi-sdk.js" strategy="beforeInteractive" />
      </body>
    </html>
  );
}
