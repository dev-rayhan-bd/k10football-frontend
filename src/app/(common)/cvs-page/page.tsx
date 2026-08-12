import React from 'react'
import SearchBar from '@/components/cvs-page/SearchBar'
import AnalyciesSection from '@/components/cvs-page/AnalyciesSection'
import ImageCarousel from '@/components/common/ImageCarousel'
import StartJourneySection from '@/components/common/StartJourneySection'
import Players from '@/components/cvs-page/PlayerSection'
import Coaches from '@/components/cvs-page/CoatchesSection'

const CVSPage = () => {
  return (
    <div>
      <SearchBar />
      <AnalyciesSection />
      <Players />
      <Coaches />
      <ImageCarousel />
      <StartJourneySection />
    </div>
  )
}

export default CVSPage