import { Suspense } from 'react'
import PayoutsContent from './PayoutsContent'

export default function PayoutsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading…</div>}>
      <PayoutsContent />
    </Suspense>
  )
}
