'use client'
import React, { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { usePathname } from 'next/navigation'

const Stairs = ({ children }) => {
    const currentLocation = usePathname()
    const pagRef = useRef(null)
    const stairParent = useRef(null)


    useGSAP(function () {
        const tl = gsap.timeline()
        tl.to(stairParent.current, {
            display: "block"
        })
        tl.from('.stairs', {
            height: 0,
            stagger: {
                amount: -0.25
            }
        })
        tl.to('.stairs', {
            y: "100%",
            stagger: {
                amount: -0.25
            }
        })
        tl.to(stairParent.current, {
            display: "none"
        })
        tl.to('.stairs', {
            y: "0%"
        })
        gsap.from(pagRef.current, {
            opacity: 0,
            delay: 1.5,
            scale: 1.2
        })
    }, [currentLocation])
    return (
        <div>


            <div ref={stairParent} className='h-screen  w-full fixed top-0 z-20'>
                <div className='h-full flex w-full '>
                    <div className='stairs h-full w-1/5  bg-black'></div>
                    <div className='stairs h-full w-1/5  bg-black'></div>
                    <div className='stairs h-full w-1/5  bg-black'></div>
                    <div className='stairs h-full w-1/5  bg-black'></div>
                    <div className='stairs h-full w-1/5  bg-black'></div>
                </div>
            </div>
            <div className='' ref={pagRef}>
                {children}
            </div>
        </div>
    )
}

export default Stairs
