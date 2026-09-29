import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import Script from 'next/script'
import './globals.css'

export const metadata: Metadata = {
  title: 'Qmoosa Pi — AI Agentic & Conway Automaton Launchpad (Pi Network & x402 Bazaar)',
  description: 'Pi-native launchpad for AI agents, multi-model intelligence, and deterministic Conway Automata with Post-Quantum (PQC) security and x402 v2 Bazaar protocol integration.',
  generator: 'Next.js',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        {children}
        <Script src="https://sdk.minepi.com/pi-sdk.js" strategy="beforeInteractive" />
        <Analytics />
      </body>
    </html>
  )
}
