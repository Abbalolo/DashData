"use client"
import { usePathname } from 'next/navigation'
import React from 'react'
import Navigator from '../components/navigator'

function page({}) {
    const pageName = usePathname()

  return (
    <div>
       <Navigator page={pageName}/>

       <div className="p-5">
        transactions
       </div>
    </div>
  )
}

export default page