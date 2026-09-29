import "./globals.css";

export const metadata = {
  title: "Qmoosa Pi Mainnet",
  description: "Official Qmoosa Pi Network Mainnet Application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://sdk.minepi.com/pi-sdk.js"></script>
      </head>
      <body>{children}</body>
    </html>
  );
}
