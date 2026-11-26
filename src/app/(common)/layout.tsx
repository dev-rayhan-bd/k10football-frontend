import Footer from '@/components/shared/Footer'
import { Navbar } from '@/components/shared/Navbar'
import HideOnRoutes from '@/components/shared/HideOnRoutes'
import React from 'react'

// Shared CV links (coach Share Agent, player CVs Library share) are standalone pages — no site navbar or footer.
const STANDALONE_ROUTES = ['/cvs/coach-cv-details', '/players/share']

const Layout = ({children}: { children: React.ReactNode }) => {
  return (
    <div className='min-h-screen flex flex-col justify-between'>
        <HideOnRoutes routes={STANDALONE_ROUTES}>
          <Navbar/>
        </HideOnRoutes>
        <main className='flex-1'>{children}</main>
        <HideOnRoutes routes={STANDALONE_ROUTES}>
          <Footer/>
        </HideOnRoutes>
    </div>
  )
}

export default Layout
