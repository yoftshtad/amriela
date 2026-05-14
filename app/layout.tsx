import type { Metadata } from 'next'
import { Geist, Geist_Mono, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });
const _playfairDisplay = Playfair_Display({ subsets: ["latin"], weight: "700" });

export const metadata: Metadata = {
  title: 'Amriela Pastries',
  description: 'Explore our delicious coffee, cakes, and pastries',
  
  icons: {
    icon: [
      {
        url: '/favicon.jpg',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/favicon.jpg',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/favicon.jpg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/favicon.jpg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
        >
          {children}
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </ThemeProvider>
      </body>
    </html>
  )
}