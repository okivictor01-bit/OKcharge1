import { Suspense } from 'react'
import QrCodesContent from './QrCodesContent'

export default function QrCodesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading…</div>}>
      <QrCodesContent />
    </Suspense>
  )
}
