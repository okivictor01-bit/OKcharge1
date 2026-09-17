import { Suspense } from 'react'
import RentalForm from './RentalForm'

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading…</div>}>
      <RentalForm />
    </Suspense>
  )
}
