import { Suspense } from 'react'
import AccountContent from './AccountContent'

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading…</div>}>
      <AccountContent />
    </Suspense>
  )
}
