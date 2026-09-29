import Script from "next/script";
import "./globals.css";

export const metadata = {
  title: "Qmoosa Pi",
  description: "Pi-native authentication, payments, Conway computation and experimental agentic security research.",
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
