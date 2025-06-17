import Image from 'next/image'
import React from 'react'
import logo from '@/public/favicon.png'
const Navbar = () => {
    return (
        <div className=' w-48 bg-[#2F4F4F] px-4'>
            <div className='text-center space-y-2 text-white font-bold'>
                <Image className='w-full' src={logo} alt="alt" width={100} height={100} />
                <div>
                    <h2 className=' text-4xl'>নিবির</h2>
                    <p className='text-xs'>জমির হিসাব, নির্ভুলভাবে</p>
                </div>
            </div>

        </div>
    )
}

export default Navbar