import React from 'react'
import SearchBar from '@/components/cvs/SearchBar'
import AnalyciesSection from '@/components/cvs/AnalyciesSection'
import ImageCarousel from '@/components/common/ImageCarousel'
import StartJourneySection from '@/components/common/StartJourneySection'
import Players from '@/components/cvs/PlayerSection'
import Coaches from '@/components/cvs/CoatchesSection'

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