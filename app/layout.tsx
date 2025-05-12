
import './globals.css'
import { Inter } from 'next/font/google'
import { Navbar } from '@/components/navbar'
import { Providers } from './providers'
import Analytics from '@/components/Analytics'


const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Manga Tracker',
  description: 'Track your favorite manga and where you\'re reading them',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <html lang="en">
      <head>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8450170649404542"
          crossOrigin="anonymous"></script>        
      </head>
      <body className={inter.className + " bg-zinc-950 text-white min-h-screen"}>
        <Providers>
          <Navbar  />
          <Analytics /> {/* ✅ Adicionando o componente no client */}
          {children}
        </Providers>
      </body>
    </html>
  )
}

