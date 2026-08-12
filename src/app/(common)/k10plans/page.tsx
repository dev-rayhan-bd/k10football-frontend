import React from 'react'
import MembershipPlanSection from '@/components/common/MembershipPlanSection'
import ImageCarousel from '@/components/common/ImageCarousel'
import StartJourneySection from '@/components/common/StartJourneySection'

const PlansPage = () => {
  return (
    <div>
      <MembershipPlanSection/>
      <ImageCarousel/>
      <StartJourneySection/>
    </div>
  )
}

export default PlansPage