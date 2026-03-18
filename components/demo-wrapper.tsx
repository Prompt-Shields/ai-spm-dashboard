'use client'
import { useState } from 'react'
import { AppHeader } from './app-header'
import { DemoJourney } from './demo-journey'

export function DemoWrapper() {
  const [demoActive, setDemoActive] = useState(false)
  return (
    <>
      <AppHeader onStartDemo={() => setDemoActive(true)} />
      {demoActive && <DemoJourney onClose={() => setDemoActive(false)} />}
    </>
  )
}
