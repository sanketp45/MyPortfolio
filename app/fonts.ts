// app/fonts.ts
import { Gabarito, Hanken_Grotesk, Instrument_Serif, JetBrains_Mono, Kalam } from 'next/font/google';

export const display = Gabarito({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

export const body = Hanken_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
});

export const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

// Accent lines only (e.g. a case study's closing aside), always italic.
export const serif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: 'italic',
  variable: '--font-serif',
  display: 'swap',
});


// Handwriting for case-study sticky notes only.
export const hand = Kalam({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-hand',
  display: 'swap',
});
