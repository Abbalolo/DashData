
import Link from 'next/link'

import React from 'react'

import Hamburger from "./Hanbuger";

function Header() {
   
  
    
  return (
    <>
     
    <div className='flex justify-between items-center p-5'>
        <Link href="/" className="font-bold">DashData</Link>
       
    <Hamburger/>
    </div>
    </>
  )
}

export default Header