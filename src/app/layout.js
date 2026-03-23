import '../styles/globals.css'
import { Inter, Poppins, JetBrains_Mono } from 'next/font/google'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const poppins = Poppins({ 
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
})

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-mono',
})

export const metadata = {
  title: 'ModShop - The Stripe for Mod Creators',
  description: 'Instant storefront platform for selling game mods. Handle payments, delivery, updates, and fraud protection with ease.',
  keywords: ['game mods', 'mod marketplace', 'creator economy', 'sell mods', 'gaming'],
  authors: [{ name: 'ModShop Team' }],
  openGraph: {
    title: 'ModShop - The Stripe for Mod Creators',
    description: 'Instant storefront platform for selling game mods',
    type: 'website',
    locale: 'en_US',
    siteName: 'ModShop',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ModShop - The Stripe for Mod Creators',
    description: 'Instant storefront platform for selling game mods',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
