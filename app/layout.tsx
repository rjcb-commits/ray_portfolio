import './globals.css'
import type { Metadata } from 'next'
import { Inter, Instrument_Serif } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-serif',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://rayzjack.com'),
  title: 'Raymond Jack — Data Scientist',
  description:
    'Data scientist with 19 years in retail banking. Production ML, SQL/Python pipelines, and Tableau dashboards for retail banking operations. Side projects in Android.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Raymond Jack — Data Scientist',
    description:
      'Data scientist with 19 years in retail banking. Production ML, SQL/Python pipelines, and Tableau dashboards for retail banking operations.',
    type: 'website',
    url: 'https://rayzjack.com',
    siteName: 'Raymond Jack',
    images: [
      {
        url: '/og.png',
        width: 1731,
        height: 909,
        alt: 'Raymond Jack — Data Scientist · Applied ML & Analytics',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Raymond Jack — Data Scientist',
    description:
      'Data scientist building production ML, SQL/Python pipelines, and Tableau dashboards for retail banking operations.',
    images: ['/og.png'],
  },
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${instrumentSerif.variable}`}>
      <body>{children}</body>
    </html>
  )
}
