"use client"
import dynamic from 'next/dynamic'

const AboutFooterCTAWrapped = dynamic(() => import('./AboutFooterCTAWrapped'), { ssr: false })

export default function AboutFooterCTADynamic() {
  return <AboutFooterCTAWrapped />
}
