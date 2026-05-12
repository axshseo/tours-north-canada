import './globals.css'
import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import MainNav from '../components/MainNav'
import SiteFooter from '../components/SiteFooter'
import Script from 'next/script'

export const metadata: Metadata = {
  title: 'Tours North | Canada\'s Ultimate Booking Portal',
  description: 'Instantly book over 250 curated Canadian tours — from the Rockies to the Maritimes.',
  themeColor: '#064e3b',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/assets/icons/icon-192x192.png" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>
      <body className="min-h-screen bg-[#f8fafc] font-inter antialiased">
        <div className="relative flex min-h-screen flex-col">
          <MainNav />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </div>

        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', 'G-XXXXXXXXXX');
          `}
        </Script>

        {/* Toast Notifications */}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
