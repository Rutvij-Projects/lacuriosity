import type { Metadata, Viewport } from 'next';
import { Fraunces, Newsreader, IBM_Plex_Mono } from 'next/font/google';
import { Masthead } from '@/components/Masthead';
import { Footer } from '@/components/Footer';
import { getPillars } from '@/lib/data';
import './globals.css';

const fraunces = Fraunces({ subsets: ['latin'], weight: ['600', '700', '800', '900'], variable: '--font-fraunces' });
const newsreader = Newsreader({ subsets: ['latin'], weight: ['400', '500', '600'], style: ['normal', 'italic'], variable: '--font-newsreader' });
const plexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-plex-mono' });

export const metadata: Metadata = {
  metadataBase: new URL('https://lacuriosity.com'),
  title: { default: 'LaCuriosity — Learn something new, every day', template: '%s · LaCuriosity' },
  description: 'One long-form article a day across five streams of curiosity: the physical world, the human mind, the systems we build, pure ideas, and the planet.',
  openGraph: { siteName: 'LaCuriosity', type: 'website' },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F3EDE2' },
    { media: '(prefers-color-scheme: dark)', color: '#14120F' },
  ],
};

// Runs before first paint so a saved theme never flashes the wrong colours.
const themeScript = `try{var t=localStorage.getItem('lc-theme');if(t)document.documentElement.dataset.theme=t}catch(e){}`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const pillars = await getPillars();
  return (
    <html lang="en" className={`${fraunces.variable} ${newsreader.variable} ${plexMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Masthead pillars={pillars} buildDate={new Date().toISOString()} />
        {children}
        <Footer pillars={pillars} />
      </body>
    </html>
  );
}
