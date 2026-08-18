import Image from "next/image";
import React from 'react'
import ServiceSection from '@/components/about/ServiceSection'
import AdditionalServices from '@/components/services/AdditionalServices'
import ImageCarousel from '@/components/common/ImageCarousel'
import StartJourneySection from '@/components/common/StartJourneySection'

const ServicePage = () => {
  return (
    <div>
      <ServiceSection/>
      <AdditionalServices/>
      <ImageCarousel/>
      <StartJourneySection/>
    </div>
  )
}

export default ServicePage