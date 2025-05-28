'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { AuthKitProvider } from '@farcaster/auth-kit';

const inter = Inter({ subsets: ['latin'] });

const config = {
  rpcUrl: 'https://mainnet.optimism.io',
  domain: 'whatgenreareyou.vercel.app',
  siweUri: 'https://whatgenreareyou.vercel.app',
  version: '1',
  relay: 'https://relay.farcaster.xyz',
};

export const metadata = {
  title: 'What Music Genre Are You?',
  description: 'Discover your musical soul with this personality quiz!',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthKitProvider config={config}>
          {children}
        </AuthKitProvider>
      </body>
    </html>
  );
}