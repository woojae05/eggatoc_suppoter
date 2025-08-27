import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ChakraProvider } from '@/providers/ChakraProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '관리 시스템',
  description: 'Next.js와 Chakra UI로 구축된 관리 시스템',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <ChakraProvider>
          {children}
        </ChakraProvider>
      </body>
    </html>
  )
}