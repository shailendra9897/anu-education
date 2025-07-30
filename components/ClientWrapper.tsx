'use client';

import Header from '@/components/Header'; // ✅ Fix: import default
import LeadModal from '@/components/LeadModal';

export default function ClientWrapper() {
  return (
    <>
      <LeadModal />
      <Header />
    </>
  );
}