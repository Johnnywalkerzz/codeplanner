import '@/app/globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import '@/styles/animations.css';
import '@/styles/prism-theme.css';
import DebugToolbar from '@/components/DebugToolbar';

const inter = Inter({ subsets: ['latin'] });

// Viewport configuration - separate export
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8fafc' },
    { media: '(prefers-color-scheme: dark)', color: '#020617' }
  ],
};

// Metadata configuration
export const metadata: Metadata = {
  title: 'CodePlanner - Break Down Your Coding Projects',
  description: 'An AI-powered app to break down coding projects into actionable steps with implementation guides',
  applicationName: 'CodePlanner',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'CodePlanner'
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-slate-950 text-slate-200 antialiased`}>
        <main className="min-h-screen">
          {children}
        </main>
        {/* Debug toolbar for development - only added in development environment */}
        {process.env.NODE_ENV !== 'production' && (
          <DebugToolbar showInitially={false} position="bottom" />
        )}
      </body>
    </html>
  );
}