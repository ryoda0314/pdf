'use client';

import dynamic from 'next/dynamic';

const PdfWorkspace = dynamic(() => import('@/components/PdfWorkspace').then(mod => mod.PdfWorkspace), { ssr: false });

export default function Home() {
  return (
    <main>
      <PdfWorkspace />
    </main>
  );
}
